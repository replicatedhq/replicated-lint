"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var yaml = require("js-yaml");
var _ = require("lodash");
var ruler = require("ruler");
var ast = require("yaml-ast-parser");
var lineColumn = require("line-column");
var ast_1 = require("./ast");
var RulerPredicate = (function () {
    function RulerPredicate(matcher) {
        this.matcher = matcher;
    }
    RulerPredicate.prototype.test = function (object) {
        var matched = ruler(this.matcher).test(object);
        var paths = [this.matcher.path];
        return { matched: matched, paths: paths };
    };
    return RulerPredicate;
}());
exports.RulerPredicate = RulerPredicate;
var DOC_SEPARATOR_LENGTH = 3;
function lintMultidoc(inYaml, rules) {
    var docs = inYaml.split("---").slice(1);
    var offset = inYaml.indexOf("---") + 3;
    var lineColumnFinder = lineColumn(inYaml);
    return _.map(docs, function (doc, index) {
        var vetted = lint(doc, rules, lineColumnFinder, offset);
        offset += doc.length + DOC_SEPARATOR_LENGTH;
        return ({
            index: index,
            findings: vetted,
        });
    });
}
exports.lintMultidoc = lintMultidoc;
function lint(inYaml, rules, lineColumnFinder, positionOffset) {
    var offset = positionOffset || 0;
    lineColumnFinder = lineColumnFinder || lineColumn(inYaml);
    if (!inYaml) {
        return [noDocError(inYaml)];
    }
    var root;
    try {
        root = yaml.safeLoad(inYaml);
    }
    catch (err) {
        return [loadYamlError(err, inYaml, lineColumnFinder, offset)];
    }
    if (!root) {
        return [noDocError(inYaml)];
    }
    var yamlAST = ast.safeLoad(inYaml, null);
    if (_.isEmpty(rules)) {
        return [];
    }
    var ruleTriggers = [];
    _.forEach(rules, function (rule) {
        var result = rule.test.test(root);
        if (result.matched) {
            var positions = _.flatMap(result.paths, function (path) { return ast_1.astPosition(yamlAST, path, lineColumnFinder, offset); });
            if (_.isEmpty(positions)) {
                var shorterPaths = _.map(result.paths, function (p) { return p.split(".").slice(0, -1).join("."); });
                positions = _.flatMap(shorterPaths, function (path) { return ast_1.astPosition(yamlAST, path, lineColumnFinder, offset); });
            }
            ruleTriggers.push({
                type: rule.type,
                rule: rule.name,
                received: _.map(result.paths, function (p) { return _.get(root, p); })[0],
                message: rule.message,
                positions: positions,
            });
        }
    });
    return ruleTriggers;
}
exports.lint = lint;
function loadYamlError(err, inYaml, lineColumnFinder, offset) {
    return {
        type: "error",
        rule: "validYaml",
        received: inYaml,
        positions: [
            {
                start: {
                    column: lineColumnFinder.fromIndex(err.mark.position + offset).col - 1,
                    line: lineColumnFinder.fromIndex(err.mark.position + offset).line - 1,
                    position: err.mark.position + offset,
                },
            },
        ],
        message: err.message,
    };
}
function noDocError(inYaml) {
    return {
        type: "warn",
        rule: "notEmpty",
        received: inYaml,
        message: "No document provided",
    };
}
