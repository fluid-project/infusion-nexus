"use strict";

var fluid = require("infusion"),
    gpii = fluid.registerNamespace("gpii");

fluid.defaults("gpii.nexus", {
    gradeNames: ["kettle.app"],
    requestHandlers: {
        readDefaults: {
            route: "/defaults/:gradeName",
            method: "get",
            type: "gpii.nexus.readDefaults.handler"
        },
        writeDefaults: {
            route: "/defaults/:gradeName",
            method: "put",
            type: "gpii.nexus.writeDefaults.handler"
        },
        construct: {
            route: "/components/:path",
            method: "post",
            type: "gpii.nexus.construct.handler"
        },
        bindModel: {
            route: "/bindModel/:componentPath/:modelPath",
            type: "gpii.nexus.bindModel.handler"
        }
    }
});

fluid.defaults("gpii.nexus.readDefaults.handler", {
    gradeNames: ["kettle.request.http"],
    invokers: {
        handleRequest: {
            funcName: "gpii.nexus.readDefaults.handleRequest",
            args: ["{request}.req.params.gradeName", "{request}"]
        }
    }
});

gpii.nexus.readDefaults.handleRequest = function (gradeName, request) {
    var defaults = fluid.defaults(gradeName);
    if (defaults) {
        request.events.onSuccess.fire(defaults);
    } else {
        request.events.onError.fire({
            message: "Grade not found",
            statusCode: 404
        });
    }
};

fluid.defaults("gpii.nexus.writeDefaults.handler", {
    gradeNames: ["kettle.request.http"],
    invokers: {
        handleRequest: {
            funcName: "gpii.nexus.writeDefaults.handleRequest",
            args: ["{request}.req.params.gradeName", "{request}"]
        }
    }
});

gpii.nexus.writeDefaults.handleRequest = function (gradeName, request) {
    fluid.defaults(gradeName, request.req.body);
    request.events.onSuccess.fire();
};

fluid.defaults("gpii.nexus.construct.handler", {
    gradeNames: ["kettle.request.http"],
    invokers: {
        handleRequest: {
            funcName: "gpii.nexus.construct.handleRequest",
            args: ["{request}.req.params.path", "{request}"]
        }
    }
});

gpii.nexus.construct.handleRequest = function (path, request) {
    fluid.construct(path, request.req.body);
    request.events.onSuccess.fire();
};

fluid.defaults("gpii.nexus.bindModel.handler", {
    gradeNames: ["kettle.request.ws"],
    members: {
        boundComponent: null // TODO: Should this be a model property? Or a subcomponent?
    },
    invokers: {
        boundModelChangeListener: {
            funcName: "gpii.nexus.bindModel.boundModelChangeListener",
            args: [
                "{that}",
                "{arguments}.0" // value
            ]
        }
    },
    listeners: {
        onBindWs: {
            funcName: "gpii.nexus.bindModel.bindWs",
            args: [
                "{that}",
                "{request}.req.params.componentPath",
                "{request}.req.params.modelPath",
                "{that}.boundModelChangeListener"
            ]
        },
        onReceiveMessage: {
            funcName: "gpii.nexus.bindModel.receiveMessage",
            args: [
                "{that}",
                "{arguments}.1" // message
            ]
        }
    }
});

gpii.nexus.bindModel.bindWs = function (that, componentPath, modelPath, modelChangeListener) {
    // that.boundComponent = fluid.componentForPath(componentPath);
    that.boundComponent = fluid.globalInstantiator.pathToComponent[componentPath]; // TODO: ?
    // TODO: Note that applier.modelchanged.addListener is different from https://wiki.gpii.net/w/Nexus_API
    //       Which says applier.addModelListener
    that.boundComponent.applier.modelChanged.addListener(modelPath, modelChangeListener); // TODO: namespace?
};

gpii.nexus.bindModel.boundModelChangeListener = function (that, value) {
    that.sendMessage(value);
};

gpii.nexus.bindModel.receiveMessage = function (that, message) {
    // TODO: Rebase path, relative to the modelPath bound to
    that.boundComponent.applier.change(message.path, message.value, message.type);
};
