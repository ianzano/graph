const GRID_SIZE = 25;

const X_AXIS = 15;
const Y_AXIS = 15;

const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

function getLinesX() {
    return Math.floor(canvas.height / GRID_SIZE);
}

function getLinesY() {
    return Math.floor(canvas.width / GRID_SIZE);
}

function drawCoord() {
    // draw x lines
    const linesX = getLinesX();

    for(let x = 0; x <= linesX; x++) {
        context.beginPath();

        context.lineWidth = 1;
        context.strokeStyle = x == X_AXIS ? "#000000" : "#E9E9E9";

        let y = GRID_SIZE * x;
        if(x != linesX)
            y += .5;
    
        context.moveTo(0, y);
        context.lineTo(canvas.width, y);

        context.stroke();
    }

    // draw y lines
    const linesY = getLinesY();

    for(let y = 0; y <= linesY; y++) {
        context.beginPath();

        context.lineWidth = 1;
        context.strokeStyle = y == Y_AXIS ? "#000000" : "#E9E9E9";

        let x = GRID_SIZE * y;
        if(x != linesY)
            x += .5;
    
        context.moveTo(x, 0);
        context.lineTo(x, canvas.height);

        context.stroke();
    }

    context.translate(Y_AXIS * GRID_SIZE, X_AXIS * GRID_SIZE);

    // positive x axis labels and marks
    for(let y = 1; y < linesY - Y_AXIS; y++) {
        context.beginPath();
        context.lineWidth = 1;
        context.strokeStyle = "#000000";

        context.moveTo(GRID_SIZE * y + .5, -3);
        context.lineTo(GRID_SIZE * y + .5, 3);
        context.stroke();

        context.font = '9px Arial';
        context.textAlign = 'center';
        context.fillText(y, GRID_SIZE * y, 15);
    }

    // negative x axis labels and marks
    for(let y = 1; y < Y_AXIS; y++) {
        context.beginPath();
        context.lineWidth = 1;
        context.strokeStyle = "#000000";

        context.moveTo(-GRID_SIZE * y + .5, -3);
        context.lineTo(-GRID_SIZE * y + .5, 3);
        context.stroke();

        context.font = '9px Arial';
        context.textAlign = 'center';
        context.fillText(-y, -GRID_SIZE * y, 15);
    }

    // negative y axis labels and marks
    for(let x = 1; x < linesX - X_AXIS; x++) {
        context.beginPath();
        context.lineWidth = 1;
        context.strokeStyle = "#000000";

        context.moveTo(-3, GRID_SIZE * x + .5);
        context.lineTo(3, GRID_SIZE * x + .5);
        context.stroke();

        context.font = '9px Arial';
        context.textAlign = 'start';
        context.fillText(-x, 8, GRID_SIZE * x + 3);
    }

    // positive y axis labels and marks
    for(let x = 1; x < X_AXIS; x++) {
        context.beginPath();
        context.lineWidth = 1;
        context.strokeStyle = "#000000";

        context.moveTo(-3, -GRID_SIZE * x + .5);
        context.lineTo(3, -GRID_SIZE * x + .5);
        context.stroke();

        context.font = '9px Arial';
        context.textAlign = 'start';
        context.fillText(x, 8, -GRID_SIZE * x + 3);
    }
}

function handleTerm(term, x) {
    // parentheses
    // handle each subterm inside a parentheses as an own term recusively
    let success;
    do {
        success = false;
        term = term.replace(new RegExp(`\\(([^\\(]+?)\\)(\\^${regexNumber})?`, "g"), (_, contents, power) => {
            success = true;
            let result = handleTerm(contents, x)
            if(power)
                result = "(" + result + power + ")";
            return result;
        });
    } while(success);

    // exponentation
    term = repeatedOperation(term, "\\^", (p1, p2) => Math.pow(p1, p2))
    
    // multiplication/division
    term = repeatedOperation(term, "\\*", (p1, p2) => p1 * p2)
    term = repeatedOperation(term, "\\/", (p1, p2) => p1 / p2)

    // handle multiple symbols
    term = term.replace(/\-\-/g, "+");
    term = term.replace(/\+\-/g, "-");

    // addition/subtraction
    term = repeatedOperation(term, "\\-", (p1, p2) => p1 - p2)
    term = repeatedOperation(term, "\\+", (p1, p2) => p1 + p2)

    // fractions (represented by colon), used to ease equations
    // (5+5)/(2+3) = 5+5:2+3
    term = repeatedOperation(term, "\\:", (p1, p2) => p1 / p2)

    return term;
}

// matches a single number with optional decimals in a term
const regexNumber = "([\\-]?[0-9]+(?:\\.[0-9]+)?)"

// generic function to handle a mathematical operation
function repeatedOperation(subject, operand, operation) {
    let success;
    let term = subject
    do {
        success = false;
        term = term.replace(new RegExp(`${regexNumber}${operand}${regexNumber}`, "g"), (_, p1, p2) => {
            success = true;
            return operation(parseFloat(p1), parseFloat(p2))
        });
    } while(success);
    return term;
}

let initialized = false;

// redraws the canvas, clearing any existing graphs
function redraw() {
    initialized = true;
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);

    drawCoord(context, canvas);
}

// draws a graph
function draw() {
    if(!initialized)
        redraw();
        
    let full = document.getElementById("full").value;

    // constants
    full = full.replace(/([0-9]+(?:\.[0-9]+)?)?\e/, (_, p) => {
        return ((p || 1) * Math.E).toFixed(2);
    });

    const linesY = getLinesY();
    for(let x = -Y_AXIS; x <= linesY - Y_AXIS; x+=.1) {
        
        const X = parseFloat(x.toFixed(2))

        let term = full.replace(/([0-9]+(?:\.[0-9]+)?)?\x/g, (_, p) => (p || 1) * X);

        let calc = handleTerm(term, X);

        context.beginPath();
        
        context.moveTo(
            x * GRID_SIZE, 
            - (calc * GRID_SIZE),
        );

        const X1 = parseFloat((x + .1).toFixed(2));

        term = full.replace(/([0-9]+(?:\.[0-9]+)?)?\x/g, (_, p) => (p || 1) * X1);
    
        calc = handleTerm(term, X1);

        context.lineTo(
            (x + .1) * GRID_SIZE, 
            - (calc * GRID_SIZE)
        );

        context.stroke();
    }
}