class Node {
    constructor(op, left, right = null) {
        this.left = left;
        this.right = right;
        this.op = op;
        this.type = '';
    }

    setRight(right) {
        this.right = right;
    }

    setLeft(left) {
        this.left = left;
    }

    setOp(op) {
        this.op = op;
    }

    setName(name) {
        this.name = name;
    }

    getNode() {
        return this;
    }
}

class Exp { }

function strToExp(str) {
    str = str.trim();
    str = str.replace(/\s/ig, '');
    let level = 0;//inside parentheses check
    //case + or -
    //most right '+' or '-' (but not inside '()') search and split
    for (let i = str.length - 1; i >= 0; --i) {
        let c = str[i];
        if (c == ')') {
            ++level;
            continue;
        }
        if (c == '(') {
            --level;
            continue;
        }
        if (level > 0) continue;
        if ((c == '+' || c == '-') && i != 0) {//if i==0 then s[0] is sign
            let left = str.substr(0, i);
            let right = str.substr(i + 1);
            return new Node(c, strToExp(left), strToExp(right));
        }
    }
    //case * or /
    //most right '*' or '/' (but not inside '()') search and split
    for (let i = str.length - 1; i >= 0; --i) {
        let c = str[i];
        if (c == ')') {
            ++level;
            continue;
        }
        if (c == '(') {
            --level;
            continue;
        }
        if (level > 0) continue;
        if (c == '*' || c == '/') {
            let left = str.substr(0, i);
            let right = str.substr(i + 1);
            return new Node(c, strToExp(left), strToExp(right));
        }
    }
    for (let i = str.length - 1; i >= 0; --i) {
        let c = str[i];
        if (c == ')') {
            ++level;
            continue;
        }
        if (c == '(') {
            --level;
            continue;
        }
        if (level > 0) continue;
        if (c == '<' || c == '>' || c == '=') {
            let left = str.substr(0, i);
            let right = str.substr(i + 1);
            return new Node(c, strToExp(left), strToExp(right));
        }
    }
    if (str[0] == '(') {
        //case ()
        //pull out inside and to strToExp
        for (let i = 0; i < str.length; ++i) {
            if (str[i] == '(') {
                ++level;
                continue;
            }
            if (str[i] == ')') {
                --level;
                if (level == 0) {
                    let exp = (str.substr(1, i - 1));
                    return strToExp(exp);
                }
                continue;
            }
        }
    } else {
        return str;
    }

    return "ERROR";

}
let graph = [];




let res_words = ["if", "then", "else", "end", "repeat", "until", "read", "write", ";"]
let sp_symbols = ["+", "-", "*", "/", "=", "<", "(", ")", ";", ":=", ":"]

let state = {
    current_state: -1,
    parent_node: -1,
    horizontal: true,
    lastFactor: null,
    draw_id: false,
    draw_id_block: true
};

function buildNodes(node) {

    let nodeObj = {
        text: { name: `Op (${node.op})` },
        children: [],
        HTMLclass: 'first-draw'
    };
    let leftObj = {};
    let rightObj = {};

    if (node.left instanceof Node) {
        leftObj = buildNodes(node.left); // Node 
        nodeObj.children.push(leftObj);
    }
    if (!(node.left instanceof Node)) {
        leftObj = {
            text: { name: `${node.left}` },
            HTMLclass: 'first-draw'
        }
        nodeObj.children.push(leftObj);
    }
    if (node.right instanceof Node) {
        rightObj = buildNodes(node.right);
        nodeObj.children.push(rightObj);
    }

    if (!(node.right instanceof Node) && node.right) {
        rightObj = {
            text: { name: `${node.right}` },
            HTMLclass: 'first-draw'
        }
        nodeObj.children.push(rightObj);
    }

    return nodeObj;
}



let code = document.getElementById('tiny-lang');
let btn = document.getElementById('btn-generate');
let tokenIdx = 0;
var token = "";
let lines;

btn.addEventListener('click', () => {
    let newCode = code.value;
    let combined_sp_res = Array.from(new Set([...res_words, ...[":="]]));
    for (let word of combined_sp_res) {
        newCode = newCode.replace(new RegExp(`${word}`, 'ig'), ` ${word} `);
    }
    ["+", "-", "*", "/", "=", "<", "(", ")"].forEach(x => {
        newCode = newCode.replace(new RegExp(`[${x}]`, 'ig'), ` ${x} `);
    })
    lines = [];
    let templines = newCode.replace(/\n/ig, '').split(' ').filter(x => x !== "");
    for (let i = 0; i < templines.length; i++) {
        if (templines[i] === ":" && templines[i + 1] === "=") {
            lines.push(templines[i] + templines[i + 1]);
            i++;
        } else {
            lines.push(templines[i]);
        }
    }
    tokenIdx = 0;
    token = lines[tokenIdx];
    program();
    graph = graph.filter(x => x !== undefined || x !== null);
    console.log(graph);
    show_graph(graph);
})



function show_graph(graph) {
    let simple_chart_config = {
        chart: {
            container: "#tree-simple",
            levelSeparation: 20,
            siblingSeparation: 15,
            subTeeSeparation: 15,
            rootOrientation: "WEST",
            node: {
                HTMLclass: "tennis-draw",
                drawLineThrough: true
            },
            connectors: {
                type: "straight",
                style: {
                    "stroke-width": 2.5,
                    "stroke": "#333"
                }
            }
        },
        nodeStructure: {
            text: { name: 'Parser' },
            HTMLclass: 'first-draw',
            children: graph
        }
    };

    var my_chart = new Treant(simple_chart_config);
}





function match(s, type = null) {
    if (s === "" && type === "id") {
        if (
            !res_words.includes(token)
            && /^[a-zA-Z_$][a-zA-Z_$0-9]*$/g.test(token)
        ) {
            tokenIdx++; // get next token
            token = lines[tokenIdx];
            return true;
        }
    }
    if (s == token) {
        tokenIdx++;
        token = lines[tokenIdx]; // get next token
        return true;
    }
    return false;
}



let stmtTypes = {
    IF: 0,
    REPEAT: 1,
    ASSIGN: 2,
    READ: 3,
    WRITE: 4,
    ERROR: 5,
    ID: 6,
};


// program -> stmt-seq
function program() {
    let str = stmt_seq();
    if (!str) {
        console.log('ERROR');
    }
    console.log('Program Found!');
}

// stmt-seq -> stmt {; stmt}
function stmt_seq() {
    let st = stmt();
    while (match(";")) {
        st = stmt();
    }
    return st;
}

// stmt -> if-stmt | repeat-stmt | assign-stmt | read-stmt | write-stmt
function stmt() {

    let str = if_stmt() || repeat_stmt() || assign_stmt() || read_stmt() || write_stmt();

    if (!str) {
        return false;
    }
    return str;

}

function assign_stmt() {
    state.draw_id = false;
    state.draw_id_block = false;
    let testAssign = is_id();
    state.draw_id_block = true;
    if (testAssign) {
        testAssign = match(":=");
        if (testAssign) {
            let assign_node = { text: { name: `Assign ${lines[tokenIdx - 2]}` }, children: [], HTMLclass: 'first-draw' };
            if (state.horizontal) {
                state.parent_node = tokenIdx - 2;
                graph[state.parent_node] = { text: { name: `Assign ${lines[state.parent_node]}` }, children: [], HTMLclass: 'first-draw' }
            } else {
                let id_node = tokenIdx - 2;
                graph[state.parent_node].children.push({ text: { name: `Assign ${lines[id_node]}` }, children: [], HTMLclass: 'first-draw' })
                state.parent_node = id_node;
            }
            state.draw_horizontal = false
            state.draw_id = false
            state.last_factor = null

            testAssign = exp();
            if (testAssign) {
                if (state.lastFactor) {
                    graph[state.parent_node].children.push(state.lastFactor);
                }
                state.horizontal = true;
                state.draw_id = true;
                state.draw_id_block = true;
                return true;
            } else {
                return false;
            }

        } else {
            return false;
        }

    } else {
        return false;
    }
}

// if-stmt -> if exp then stmt-seq [else stmt-seq] end
function if_stmt() {
    let testIf = match("if");
    if (testIf) {
        state.parent_node = tokenIdx - 1;
        graph[state.parent_node] = { text: { name: 'IF' }, children: [], HTMLclass: 'first-draw' };
        let if_node = tokenIdx - 1;
        let rec = state.parent_node;
        state.horizontal = false;
        testIf = exp();
        if (testIf) {
            testIf = match("then");
            if (testIf) {
                state.parent_node = if_node;
                state.horizontal = false;
                testIf = stmt_seq();
                if (testIf) {

                    if (token == "else") {
                        state.parent_node = if_node;
                        state.horizontal = false;
                        testIf = stmt_seq();
                        if (testIf) {

                        } else {
                            return false;
                        }
                    }
                } else {
                    return false;
                }

            } else {
                return false;
            }
        } else {
            return false;
        }
        // token = ";";
        testIf = match("end");
        if (testIf) {
            state.parent_node = rec;
            state.horizontal = true;
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
    // console.log("- if statement found");
}

// repeat-stmt -> repeat stmt-seq until exp
function repeat_stmt() {
    let testRep = match("repeat");
    if (testRep) {
        state.parent_node = tokenIdx - 1;
        graph[state.parent_node] = { text: { name: 'REPEAT' }, children: [], HTMLclass: 'first-draw' };
        let repeat_node = state.parent_node;
        state.horizontal = false;
        testRep = stmt_seq();
        if (testRep) {
            testRep = match('until');
            if (testRep) {
                state.parent_node = repeat_node;
                state.horizontal = false;
                testRep = exp();
                if (testRep) {
                    state.horizontal = true;
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        } else {
            return false;
        }
    } else {
        return false;
    }
    // console.log("- repeat found");
}

// read-stmt -> read identifier
function read_stmt() {
    let testRead = match("read");
    if (testRead) {
        state.draw_id_block = false;
        testRead = is_id();
        if (testRead) {
            state.parent_node = tokenIdx - 1;
            let rec = tokenIdx - 1;
            graph[state.parent_node] = { text: { name: `READ ${lines[state.parent_node]}` }, children: [], HTMLclass: 'first-draw' };
            state.draw_id_block = true;
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

// write-stmt -> write exp
function write_stmt() {
    let testWrite = match("write");
    if (testWrite) {
        state.parent_node = tokenIdx;
        if (state.horizontal) {
            graph[state.parent_node] = { text: { name: `WRITE` }, children: [], HTMLclass: 'first-draw' };
        } else {
            let write_node = { text: { name: `WRITE` }, children: [], HTMLclass: 'first-draw' };
            let write_node_id = tokenIdx;
            graph[state.parent_node].children.push(write_node);
            state.parent_node = write_node_id;
        }
        state.horizontal = false;
        testWrite = exp(true);
        if (testWrite) {
            state.horizontal = true;
            state.draw_id = true;
            state.draw_id_block = true;
            return true;
        } else {
            return false;
        }

    } else {
        return false;
    }
}




function exp(draw_id = false) {
    state.draw_id = draw_id;
    state.lastFactor = null;
    let testExp = simple_exp();
    var rec = state.parent_node
    var current_draw_h = state.draw_horizontal
    if (testExp) {
        if (match("<") || match("=")) {
            state.draw_id_block = true;
            let exp_node_comp = { text: { name: `OP ${lines[tokenIdx - 1]}` }, children: [], HTMLclass: 'first-draw' };
            if (state.horizontal) {
                state.parent_node = tokenIdx - 1;
                graph[state.parent_node] = exp_node_comp;
            } else {
                graph[state.parent_node].children.push(exp_node_comp);
                state.parent_node = tokenIdx - 1;
            }

            if (state.lastFactor) {
                graph[state.parent_node].children.push(state.lastFactor);
            }
            state.horizontal = false;
            state.draw_id_block = true;
            testExp = simple_exp();
            if (testExp) {
                state.horizontal = current_draw_h;
                state.parent_node = rec;
                return true;
            } else {
                return false;
            }

        }

    } else {
        return false;
    }
}

// simple-exp -> term { addop term }
function simple_exp() {
    state.lastFactor = null;
    let testSimpleExp = term();
    if (testSimpleExp) {

        var rec = state.parent_node
        var current_draw_h = state.draw_horizontal
        while (match("+") || match('-')) {
            state.draw_id_block = true;
            let simpleExpNode = { text: { name: `OP ${lines[tokenIdx - 1]}` }, children: [], HTMLclass: 'first-draw' };
            if (state.horizontal) {
                state.parent_node = simpleExpNode;
            } else {
                graph[state.parent_node].children.push(simpleExpNode);
                state.parent_node = tokenIdx - 1;
            }

            if (state.lastFactor) {
                graph[state.parent_node].children.push(simpleExpNode);
            }
            state.horizontal = false;

            state.lastFactor = null;

            testSimpleExp = term();
            if (state.lastFactor) {
                graph[parent_node].children.push(last_factor)
                state.lastFactor = null
            }

            if (testSimpleExp) {
                state.lastFactor = null;
            } else {
                return false;
            }
        }
        state.horizontal = current_draw_h;
        state.parent_node = rec;
        return true;
    } else {
        return false;
    }
}

// term -> factor { mulop factor }
function term() {
    state.lastFactor = null;
    let testTerm = factor();
    if (testTerm) {
        var rec = state.parent_node;
        var current_draw_h = state.horizontal;
        while (match("*") || match("/")) {
            state.draw_id_block = true;
            let termNode = { text: { name: `OP ${lines[tokenIdx - 1]}` }, children: [], HTMLclass: 'first-draw' };
            if (state.horizontal) {
                state.parent_node = tokenIdx - 1;
                graph[state.parent_node] = termNode;
            } else {
                graph[state.parent_node].children.push(termNode);
                state.parent_node = tokenIdx - 1;
            }

            if (state.lastFactor) {
                graph[state.parent_node].children.push(state.lastFactor);
            }
            state.horizontal = false;
            state.lastFactor = null;
            testTerm = factor();
            graph[state.parent_node].children.push(state.lastFactor);
            state.lastFactor = null;
            if (!testTerm) {
                return false;
            }

        }
        state.parent_node = rec;
    } else {
        return false;
    }
}

// factor -> (exp) | number | identifier
function factor() {
    let str = match("(") || exp() || match(")");
    str = str || is_number();
    str = str || is_id();
    return str;
}



function is_number() {
    if (/^[0-9]+$/ig.test(token)) {
        let num_node = { text: { name: `${token}` } };
        if (state.draw_id) {
            graph[state.parent_node] = num_node;
        }
        state.lastFactor = token;
        tokenIdx++;
    }
}


function is_id() {
    let testId = match("", "id");
    if (testId) {
        let id_node = { text: { name: `${lines[tokenIdx - 1]}` }, children: [], HTMLclass: 'first-draw' };
        if (state.draw_id && state.draw_id_block) {
            graph[state.parent_node].children.push(id_node);
        }
        state.lastFactor = id_node;
    }

    console.log(graph);
}