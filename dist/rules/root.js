"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lint_1 = require("../lint");
exports.apiVersion = {
    name: "ReplicatedAPIVersion",
    type: "error",
    message: "replicated_api_version must be present",
    test: new lint_1.RulerPredicate({
        path: "replicated_api_version",
        comparator: "exists",
    }),
};
exports.all = [
    exports.apiVersion,
];
