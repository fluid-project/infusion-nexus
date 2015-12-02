"use strict";

var fluid = require("infusion"),
    gpii = fluid.registerNamespace("gpii");

fluid.defaults("gpii.nexus", {
    gradeNames: ["kettle.app"],
    requestHandlers: {
        readDefaults: {
            route: "/defaults/:globalName",
            method: "get",
            type: "gpii.nexus.readDefaults.handler"
        }
    }
});

fluid.defaults("gpii.nexus.readDefaults.handler", {
    gradeNames: ["kettle.request.http"],
    invokers: {
        handleRequest: {
            funcName: "gpii.nexus.readDefaults.handleRequest",
            args: ["{request}.req.params.globalName", "{request}.events"]
        }
    }
});

gpii.nexus.readDefaults.handleRequest = function (globalName, events) {
    var defaults = fluid.defaults(globalName);
    events.onSuccess.fire(defaults);
};
