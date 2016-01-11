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
        constructComponent: {
            route: "/components/:path",
            method: "post",
            type: "gpii.nexus.constructComponent.handler"
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

fluid.defaults("gpii.nexus.constructComponent.handler", {
    gradeNames: ["kettle.request.http"],
    invokers: {
        handleRequest: {
            funcName: "gpii.nexus.constructComponent.handleRequest",
            args: ["{request}.req.params.path", "{request}"]
        }
    }
});

gpii.nexus.constructComponent.handleRequest = function (path, request) {
    fluid.construct(path, request.req.body);
    request.events.onSuccess.fire();
};

fluid.defaults("gpii.nexus.bindModel.handler", {
    gradeNames: ["kettle.request.ws"],
    members: {
        // We store the targetComponent inside a container so that the
        // component is isolated from IoC references. This will not be
        // necessary in the future after upcoming framework changes
        // are completed.
        // See https://issues.fluidproject.org/browse/FLUID-4925
        componentHolder: {
            targetComponent: null // Will be set at onBindWs
        },
        modelPath: null // Will be set at onBindWs
    },
    invokers: {
        targetModelChangeListener: {
            funcName: "gpii.nexus.bindModel.targetModelChangeListener",
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
                "{that}.targetModelChangeListener"
            ]
        },
        onReceiveMessage: {
            funcName: "gpii.nexus.bindModel.receiveMessage",
            args: [
                "{that}.componentHolder.targetComponent",
                "{that}.modelPath",
                "{arguments}.1" // message
            ]
        },
        onDestroy: {
            "this": "{that}.componentHolder.targetComponent.applier.modelChanged",
            method: "removeListener",
            args: ["{that}.targetModelChangeListener"]
        }
    }
});

// TODO: Support both string and array paths
// TODO: Move gpii.nexus.componentForPath to infusion FluidIoC.js "BEGIN NEXUS METHODS"
gpii.nexus.componentForPath = function (path) {
    return fluid.globalInstantiator.pathToComponent[path];
};

gpii.nexus.bindModel.bindWs = function (handler, componentPath, modelPath, modelChangeListener) {
    handler.componentHolder.targetComponent = gpii.nexus.componentForPath(componentPath);
    // TODO: Note that applier.modelchanged.addListener is different from https://wiki.gpii.net/w/Nexus_API
    //       Which says applier.addModelListener
    handler.componentHolder.targetComponent.applier.modelChanged.addListener(modelPath, modelChangeListener); // TODO: namespace?
    handler.modelPath = modelPath;

    // TODO: On connect, send a message with the current state of the component model
};

gpii.nexus.bindModel.targetModelChangeListener = function (handler, value) {
    handler.sendMessage(value);
};

gpii.nexus.bindModel.receiveMessage = function (component, baseModelPath, message) {
    var path = fluid.model.composePath(baseModelPath, message.path);
    component.applier.change(path, message.value, message.type);
};
