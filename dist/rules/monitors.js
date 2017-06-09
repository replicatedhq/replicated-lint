"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var Tester = (function () {
    function Tester() {
    }
    Tester.prototype.test = function (root) {
        if (!_.has(root, "monitors.cpuacct")) {
            return { matched: false };
        }
        if (_.isEmpty(_.get(root, "components"))) {
            return { matched: true, paths: ["monitors.cpuacct"] };
        }
        var cpuaccts = root.monitors.cpuacct;
        if (_.isEmpty(cpuaccts)) {
            return { matched: false };
        }
        var violations = _.filter(_.map(cpuaccts, function (cpuacct, index) {
            var _a = cpuacct.split(","), name = _a[0], image = _a[1];
            var componentIndex = _.findIndex(root.components, { name: name });
            if (componentIndex === -1) {
                return { cpuacct: cpuacct, index: index, path: "components" };
            }
            var container = _.find(root.components[componentIndex].containers, { image_name: image });
            if (!container) {
                return { cpuacct: cpuacct, index: index, path: "components." + componentIndex };
            }
        }));
        if (_.isEmpty(violations)) {
            return { matched: false };
        }
        return {
            matched: true,
            paths: _.map(violations, function (v) { return "monitors.cpuacct." + v.index; }).concat(_.map(violations, function (v) { return v.path; })),
        };
    };
    return Tester;
}());
exports.cpuMonitorContainerExists = {
    name: "CPUMonitorContainerExists",
    type: "error",
    message: "monitors.cpuacct entries must have matching component+container",
    test: new Tester(),
};
exports.all = [
    exports.cpuMonitorContainerExists,
];
