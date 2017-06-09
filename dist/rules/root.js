"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lint_1 = require("../lint");
exports.apiVersion = {
    name: "ReplicatedAPIVersion",
    type: "error",
    message: "replicated_api_version must be present",
    test: new lint_1.Exists("replicated_api_version"),
};
exports.all = [
    exports.apiVersion,
];
