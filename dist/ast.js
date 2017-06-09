"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var yaml_ast_parser_1 = require("yaml-ast-parser");
function findNode(root, path) {
    return findNodeRec([root], tokenize(path))[0];
}
exports.findNode = findNode;
function findNodes(root, path) {
    return findNodeRec([root], tokenize(path));
}
exports.findNodes = findNodes;
function nodePosition(node, path, lineColumnFinder, offset) {
    offset = offset || 0;
    var start = lineColumnFinder.fromIndex(node.startPosition + offset);
    if (!start) {
        console.log("start" + path);
    }
    var end = lineColumnFinder.fromIndex(node.endPosition + offset) || {
        line: 0,
        col: 0,
    };
    return {
        path: path,
        start: {
            position: node.startPosition,
            line: start.line - 1,
            column: start.col - 1,
        },
        end: {
            position: node.endPosition,
            line: end.line - 1,
            column: end.col - 1,
        },
    };
}
exports.nodePosition = nodePosition;
function astPosition(root, path, lineColumnFinder, offset) {
    if (_.isEmpty(path)) {
        return [];
    }
    var nodes = findNodes(root, path);
    return _.map(nodes, function (n) { return nodePosition(n, path, lineColumnFinder, offset); });
}
exports.astPosition = astPosition;
function findNodeRec(current, pathParts) {
    var first = pathParts[0];
    var rest = pathParts.slice(1);
    var findInMapping = function (node) {
        if (hasKey(node, first)) {
            if (_.isEmpty(rest)) {
                return [node];
            }
            return findNodeRec([node.value], rest);
        }
        return [];
    };
    var findInMap = function (node) {
        return findNodeRec(node.mappings, pathParts);
    };
    var findInSeq = function (node) {
        var seq = node;
        if (matchSeq(first)) {
            if (_.isEmpty(rest)) {
                return seq.items;
            }
            return findNodeRec(seq.items, rest);
        }
        if (isSeqIndex(first)) {
            if (!seq.items[first]) {
                return [];
            }
            if (_.isEmpty(rest)) {
                return seq.items[first];
            }
            return findNodeRec([seq.items[first]], rest);
        }
        return [];
    };
    return _.flatMap(current, function (node) {
        if (isMapping(node)) {
            return findInMapping(node);
        }
        if (isMap(node)) {
            return findInMap(node);
        }
        if (isSeq(node)) {
            return findInSeq(node);
        }
        return [];
    });
}
function tokenize(path) {
    return path.split(".");
}
function isMap(node) {
    return node.kind === yaml_ast_parser_1.Kind.MAP;
}
function isSeq(node) {
    return node.kind === yaml_ast_parser_1.Kind.SEQ;
}
function isMapping(node) {
    return node.kind === yaml_ast_parser_1.Kind.MAPPING;
}
function hasKey(c, key) {
    return (c.key && c.key.value === key) || false;
}
function matchSeq(key) {
    return key === "*";
}
function isSeqIndex(key) {
    return /\d+/.test(key);
}
