/**
 * ExpressionParser - Lightweight Math Expression Parser
 * Parses and evaluates mathematical expressions for graphing (100% offline)
 */

// Supported functions
const FUNCTIONS = {
    sin: Math.sin,
    cos: Math.cos,
    tan: Math.tan,
    abs: Math.abs,
    sqrt: Math.sqrt,
    log: Math.log10,
    ln: Math.log,
    exp: Math.exp,
    floor: Math.floor,
    ceil: Math.ceil,
    round: Math.round,
    pow: Math.pow,
};

// Constants
const CONSTANTS = {
    pi: Math.PI,
    PI: Math.PI,
    e: Math.E,
    E: Math.E,
};

/**
 * Tokenize a mathematical expression
 */
const tokenize = (expr) => {
    const tokens = [];
    let i = 0;

    while (i < expr.length) {
        const char = expr[i];

        // Skip whitespace
        if (/\s/.test(char)) {
            i++;
            continue;
        }

        // Numbers (including decimals)
        if (/\d/.test(char) || (char === '.' && /\d/.test(expr[i + 1]))) {
            let num = '';
            while (i < expr.length && (/\d/.test(expr[i]) || expr[i] === '.')) {
                num += expr[i];
                i++;
            }
            tokens.push({ type: 'NUMBER', value: parseFloat(num) });
            continue;
        }

        // Identifiers (variables, functions, constants)
        if (/[a-zA-Z]/.test(char)) {
            let id = '';
            while (i < expr.length && /[a-zA-Z0-9]/.test(expr[i])) {
                id += expr[i];
                i++;
            }

            if (FUNCTIONS[id]) {
                tokens.push({ type: 'FUNCTION', value: id });
            } else if (CONSTANTS[id] !== undefined) {
                tokens.push({ type: 'NUMBER', value: CONSTANTS[id] });
            } else {
                tokens.push({ type: 'VARIABLE', value: id });
            }
            continue;
        }

        // Operators and parentheses
        if ('+-*/^()'.includes(char)) {
            tokens.push({ type: 'OPERATOR', value: char });
            i++;
            continue;
        }

        i++;
    }

    return tokens;
};

/**
 * Parse tokens into an abstract syntax tree
 */
class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.pos = 0;
    }

    parse() {
        const result = this.expression();
        if (this.pos < this.tokens.length) {
            throw new Error('Unexpected token');
        }
        return result;
    }

    current() {
        return this.tokens[this.pos];
    }

    consume(type, value) {
        const token = this.current();
        if (!token || (type && token.type !== type) || (value && token.value !== value)) {
            throw new Error(`Expected ${value || type}`);
        }
        this.pos++;
        return token;
    }

    expression() {
        return this.additive();
    }

    additive() {
        let left = this.multiplicative();

        while (this.current()?.type === 'OPERATOR' &&
            (this.current().value === '+' || this.current().value === '-')) {
            const op = this.consume('OPERATOR').value;
            const right = this.multiplicative();
            left = { type: 'BINARY', op, left, right };
        }

        return left;
    }

    multiplicative() {
        let left = this.power();

        while (this.current()?.type === 'OPERATOR' &&
            (this.current().value === '*' || this.current().value === '/')) {
            const op = this.consume('OPERATOR').value;
            const right = this.power();
            left = { type: 'BINARY', op, left, right };
        }

        return left;
    }

    power() {
        let left = this.unary();

        if (this.current()?.type === 'OPERATOR' && this.current().value === '^') {
            this.consume('OPERATOR');
            const right = this.power(); // Right associative
            return { type: 'BINARY', op: '^', left, right };
        }

        return left;
    }

    unary() {
        if (this.current()?.type === 'OPERATOR' && this.current().value === '-') {
            this.consume('OPERATOR');
            return { type: 'UNARY', op: '-', operand: this.unary() };
        }

        if (this.current()?.type === 'OPERATOR' && this.current().value === '+') {
            this.consume('OPERATOR');
            return this.unary();
        }

        return this.call();
    }

    call() {
        if (this.current()?.type === 'FUNCTION') {
            const func = this.consume('FUNCTION').value;
            this.consume('OPERATOR', '(');
            const arg = this.expression();
            this.consume('OPERATOR', ')');
            return { type: 'CALL', func, arg };
        }

        return this.primary();
    }

    primary() {
        const token = this.current();

        if (!token) {
            throw new Error('Unexpected end of expression');
        }

        if (token.type === 'NUMBER') {
            this.pos++;
            return { type: 'NUMBER', value: token.value };
        }

        if (token.type === 'VARIABLE') {
            this.pos++;
            return { type: 'VARIABLE', name: token.value };
        }

        if (token.type === 'OPERATOR' && token.value === '(') {
            this.consume('OPERATOR', '(');
            const expr = this.expression();
            this.consume('OPERATOR', ')');
            return expr;
        }

        throw new Error(`Unexpected token: ${token.value}`);
    }
}

/**
 * Evaluate an AST with given variable values
 */
const evaluate = (ast, variables = {}) => {
    switch (ast.type) {
        case 'NUMBER':
            return ast.value;

        case 'VARIABLE':
            if (variables[ast.name] === undefined) {
                throw new Error(`Undefined variable: ${ast.name}`);
            }
            return variables[ast.name];

        case 'BINARY': {
            const left = evaluate(ast.left, variables);
            const right = evaluate(ast.right, variables);

            switch (ast.op) {
                case '+': return left + right;
                case '-': return left - right;
                case '*': return left * right;
                case '/': return left / right;
                case '^': return Math.pow(left, right);
                default: throw new Error(`Unknown operator: ${ast.op}`);
            }
        }

        case 'UNARY':
            if (ast.op === '-') {
                return -evaluate(ast.operand, variables);
            }
            throw new Error(`Unknown unary operator: ${ast.op}`);

        case 'CALL': {
            const func = FUNCTIONS[ast.func];
            if (!func) {
                throw new Error(`Unknown function: ${ast.func}`);
            }
            const arg = evaluate(ast.arg, variables);
            return func(arg);
        }

        default:
            throw new Error(`Unknown AST node type: ${ast.type}`);
    }
};

/**
 * Compile an expression into a function
 */
export const compileExpression = (expr) => {
    // Preprocess: handle implicit multiplication
    expr = expr
        .replace(/(\d)([a-zA-Z])/g, '$1*$2')  // 2x -> 2*x
        .replace(/\)\(/g, ')*(')               // )( -> )*(
        .replace(/(\d)\(/g, '$1*(')            // 2( -> 2*(
        .replace(/\)([a-zA-Z])/g, ')*$1');     // )x -> )*x

    const tokens = tokenize(expr);
    const parser = new Parser(tokens);
    const ast = parser.parse();

    return (variables) => {
        try {
            const result = evaluate(ast, variables);
            // Return NaN for undefined/infinite results
            if (!isFinite(result)) {
                return NaN;
            }
            return result;
        } catch (e) {
            return NaN;
        }
    };
};

/**
 * Generate points for graphing a function
 */
export const generatePoints = (expression, xMin = -10, xMax = 10, numPoints = 200) => {
    const compiled = compileExpression(expression);
    const points = [];
    const step = (xMax - xMin) / numPoints;

    for (let x = xMin; x <= xMax; x += step) {
        const y = compiled({ x });
        if (!isNaN(y) && isFinite(y) && Math.abs(y) < 1e10) {
            points.push({ x, y });
        }
    }

    return points;
};

/**
 * Find roots (x-intercepts) of a function
 */
export const findRoots = (expression, xMin = -10, xMax = 10) => {
    const points = generatePoints(expression, xMin, xMax, 500);
    const roots = [];

    for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];

        // Sign change indicates a root
        if (prev.y * curr.y < 0) {
            // Linear interpolation to find approximate root
            const rootX = prev.x - prev.y * (curr.x - prev.x) / (curr.y - prev.y);
            roots.push({ x: rootX, y: 0 });
        }

        // Check for exact zeros
        if (Math.abs(curr.y) < 0.0001) {
            roots.push({ x: curr.x, y: 0 });
        }
    }

    // Remove duplicates (within tolerance)
    const uniqueRoots = [];
    for (const root of roots) {
        if (!uniqueRoots.some(r => Math.abs(r.x - root.x) < 0.1)) {
            uniqueRoots.push(root);
        }
    }

    return uniqueRoots;
};

/**
 * Find vertices (local min/max) of a function
 */
export const findVertices = (expression, xMin = -10, xMax = 10) => {
    const points = generatePoints(expression, xMin, xMax, 500);
    const vertices = [];

    for (let i = 1; i < points.length - 1; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const next = points[i + 1];

        // Local maximum
        if (curr.y > prev.y && curr.y > next.y) {
            vertices.push({ x: curr.x, y: curr.y, type: 'max' });
        }

        // Local minimum
        if (curr.y < prev.y && curr.y < next.y) {
            vertices.push({ x: curr.x, y: curr.y, type: 'min' });
        }
    }

    return vertices;
};

export default {
    compileExpression,
    generatePoints,
    findRoots,
    findVertices,
};
