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
let look_up_symbols = "abcdefghijklmnopqrstuvwxyz"
let look_up_numbers = "1234567890"

let state = {
    current_state: -1,
    parent_node: -1
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
    // lines = code.value.replace(/;/ig, ' ; ').replace(/\n/ig, '').split(' ').filter(x => x !== "");
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
    token = lines[tokenIdx];
    program();
    graph = graph.filter(x => x !== undefined || x !== null)
    show_graph(graph);
})

function exprNodes(str) {
    var expression = strToExp(str);
    if (expression instanceof Node) {
        let childNodes = buildNodes(expression);
        return childNodes;
    } else {
        let childNodes = { text: { name: `${expression}` }, children: [], HTMLclass: 'first-draw' };
        return childNodes;
    }
}


// let str = 'b * (x-y)';

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





function getStmtType(s) {
    let { IF, ASSIGN, READ, WRITE, REPEAT, ERROR, ID } = stmtTypes;
    if (s == "if")
        return IF;
    if (!res_words.includes(s) && /^[a-zA-Z_$][a-zA-Z_$0-9]*$/g.test(s))
        return ID
    if (s == ":=")
        return ASSIGN;
    if (s == "read")
        return READ;
    if (s == "write")
        return WRITE;
    if (s == "repeat")
        return REPEAT;
    else
        return ERROR;
}

function match(s, type = null) {
    if (s === "" && type === "id") {
        if (
            !res_words.includes(token)
            && /^[a-zA-Z_$][a-zA-Z_$0-9]*$/g.test(token)
        ) {
            tokenIdx++; // get next token
            token = lines[tokenIdx];
        }
    }
    if (s == token) {
        tokenIdx++;
        token = lines[tokenIdx]; // get next token
    }
    else {
        // console.log("program not found")
    }
}



let stmtTypes = {
    IF: 0,
    REPEAT: 1,
    ASSIGN: 2,
    READ: 3,
    WRITE: 4,
    ERROR: 5,
    ID: 6
};


// program -> stmt-seq
function program() {
    stmt_seq();
    console.log("-- Program found");
}

// stmt-seq -> stmt {; stmt}
function stmt_seq() {
    stmt();
    while (token == ";") {
        match(";");
        stmt();
    }
}

// stmt -> if-stmt | repeat-stmt | assign-stmt | read-stmt | write-stmt
function stmt() {
    let { IF, ID, REPEAT, ASSIGN, READ, WRITE, ERROR } = stmtTypes;
    switch (getStmtType(token)) {
        case IF:
            if_stmt();
            break;
        case REPEAT:
            repeat_stmt();
            break;
        case ID:
            is_id();
            break;
        case READ:
            read_stmt();
            break;
        case WRITE:
            write_stmt();
            break;
        case ERROR:
            console.log('no stmt found');
            break;
        default:
            break;
    }
}

// if-stmt -> if exp then stmt-seq [else stmt-seq] end
function if_stmt() {
    match("if");
    graph[tokenIdx - 1] = { text: { name: 'IF' }, children: [], HTMLclass: 'first-draw' };
    state.parent_node = tokenIdx - 1;
    exp();
    match("then");
    stmt_seq();
    // token = ";";
    if (token == "else")
        stmt_seq();
    match("end");
    console.log("- if statement found");
}

// repeat-stmt -> repeat stmt-seq until exp
function repeat_stmt() {
    match("repeat");
    graph[tokenIdx] = { text: { name: 'REPEAT' }, children: [], HTMLclass: 'first-draw' };
    state.parent_node = tokenIdx;
    stmt_seq();
    match("until");
    exp();
    console.log("- repeat found");
}

// read-stmt -> read identifier
function read_stmt() {
    console.log('first', token);
    match("read");
    match("", "id");
    graph[tokenIdx - 1] = { text: { name: `READ ${lines[tokenIdx - 1]}` }, children: [], HTMLclass: 'first-draw' };
    state.parent_node = tokenIdx - 1;
    console.log("- read found");
}

// write-stmt -> write exp
function write_stmt() {
    match("write");
    graph[tokenIdx] = { text: { name: `WRITE` }, children: [], HTMLclass: 'first-draw' };
    state.parent_node = tokenIdx;
    exp();
    console.log("- write found");
}

// exp -> simple-exp [comparison-op simple-exp]
function exp() {
    /**
     * States
     *   (1) Expression 
     *   (2) Comparison
     */
    let str = '';
    while (lines[tokenIdx] && !res_words.includes(lines[tokenIdx])) {
        str += lines[tokenIdx];
        tokenIdx++;
    }
    token = lines[tokenIdx]; // Update Token Value
    let nodes = exprNodes(str);
    graph[state.parent_node].children.push(nodes);

}





function is_id() {
    match("", "id");
    match(":=");
    // Assignment Process
    // Add to Graph
    state.parent_node = tokenIdx - 2;
    graph[tokenIdx - 2] = { text: { name: `Assign ${lines[tokenIdx - 2]}` }, children: [], HTMLclass: 'first-draw' };
    exp();
}