/*
Copyright 2015, 2016, 2017 OCAD University

Licensed under the New BSD license. You may not use this file except in
compliance with this License.

You may obtain a copy of the License at
https://raw.githubusercontent.com/fluid-project/infusion-nexus/master/LICENSE.txt
*/

/* eslint-env node */

"use strict";

var fluid = require("infusion");
require("./nexusUtils.js");

fluid.defaults("fluid.nexus", {
    gradeNames: ["kettle.app"],
    components: {
        nexusComponentRoot: {
            type: "fluid.component"
        },
        bindModelTargetComponentBinder: {
            type: "fluid.nexus.targetComponentBinder"
        }
    },
    requestHandlers: {
        readDefaults: {
            route: "/defaults/:gradeName",
            method: "get",
            type: "fluid.nexus.readDefaults.handler"
        },
        writeDefaults: {
            route: "/defaults/:gradeName",
            method: "put",
            type: "fluid.nexus.writeDefaults.handler"
        },
        readComponent: {
            route: "/components/:path",
            method: "get",
            type: "fluid.nexus.readComponent.handler"
        },
        constructComponent: {
            route: "/components/:path",
            method: "put",
            type: "fluid.nexus.constructComponent.handler"
        },
        destroyComponent: {
            route: "/components/:path",
            method: "delete",
            type: "fluid.nexus.destroyComponent.handler"
        },
        bindModelWithModelPath: {
            route: "/bindModel/:componentPath/:modelPath",
            type: "fluid.nexus.bindModel.handler"
        },
        bindModelWithoutModelPath: {
            route: "/bindModel/:componentPath",
            type: "fluid.nexus.bindModel.handler"
        }
    }
});

fluid.defaults("fluid.nexus.readDefaults.handler", {
    gradeNames: ["kettle.request.http"],
    invokers: {
        handleRequest: {
            funcName: "fluid.nexus.readDefaults.handleRequest",
            args: ["{request}.req.params.gradeName", "{request}"]
        }
    }
});

fluid.nexus.readDefaults.handleRequest = function (gradeName, request) {
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

fluid.defaults("fluid.nexus.writeDefaults.handler", {
    gradeNames: ["kettle.request.http"],
    invokers: {
        handleRequest: {
            funcName: "fluid.nexus.writeDefaults.handleRequest",
            args: ["{request}.req.params.gradeName", "{request}"]
        }
    }
});

fluid.nexus.writeDefaults.handleRequest = function (gradeName, request) {
    fluid.defaults(gradeName, request.req.body);
    request.events.onSuccess.fire(undefined, {
        statusCode: 201
    });
};

fluid.defaults("fluid.nexus.readComponent.handler", {
    gradeNames: ["kettle.request.http"],
    invokers: {
        handleRequest: {
            funcName: "fluid.nexus.readComponent.handleRequest",
            args: ["{request}.req.params.path", "{request}", "{fluid.nexus}.nexusComponentRoot"]
        }
    }
});

// TODO: currently, we imagine this API endpoint exists mainly for testing.
//       In the future, the goal is to respond with the potentia and model of a component,
//       i.e. serialized material that could be used to reconstruct the component in its current state.
//       This will require some additional documentation and writeups of example use cases.
//       The ongoing design of the Nexus API is discussed at https://wiki.fluidproject.org/display/fluid/Nexus+API+revisions
/**
 * Retrieve a serialized version of a component's "shell" at a path, consisting of its construction status, typeName, model, and id.
 * @param {String} path the path to the component, can also be given as an array.
 * @param {kettle.request.http} request the request component that will mediate the response.
 * @param {fluid.component} nexusComponentRoot the component with grade nexusComponentRoot, which path is relative to.
 */
fluid.nexus.readComponent.handleRequest = function (path, request, nexusComponentRoot) {
    var component = fluid.nexus.componentForPathInContainer(nexusComponentRoot, path);
    if (component) {
        var componentShell = fluid.filterKeys(component, ["id", "lifecycleStatus", "model", "typeName"]);
        request.events.onSuccess.fire(componentShell);
    } else {
        request.events.onError.fire({
            message: "Component not found",
            statusCode: 404
        });
    }
};

fluid.defaults("fluid.nexus.constructComponent.handler", {
    gradeNames: ["kettle.request.http"],
    invokers: {
        handleRequest: {
            funcName: "fluid.nexus.constructComponent.handleRequest",
            args: ["{request}.req.params.path", "{request}", "{fluid.nexus}.nexusComponentRoot"]
        }
    }
});

// TODO: Complain when component cannot be constructed due to parent not existing
fluid.nexus.constructComponent.handleRequest = function (path, request, componentRoot) {
    var segs = fluid.pathUtil.parseEL(path);
    fluid.nexus.constructInContainer(componentRoot, segs, request.req.body);
    request.events.onSuccess.fire(undefined, {
        statusCode: 201
    });
};

fluid.defaults("fluid.nexus.destroyComponent.handler", {
    gradeNames: ["kettle.request.http"],
    invokers: {
        handleRequest: {
            funcName: "fluid.nexus.destroyComponent.handleRequest",
            args: ["{request}.req.params.path", "{request}", "{fluid.nexus}.nexusComponentRoot"]
        }
    }
});

// TODO: Complain when component is not found
fluid.nexus.destroyComponent.handleRequest = function (path, request, componentRoot) {
    var segs = fluid.pathUtil.parseEL(path);
    fluid.nexus.destroyInContainer(componentRoot, segs);
    request.events.onSuccess.fire(undefined, {
        statusCode: 204
    });
};

/**
 * This middleware grade is handed control immediately prior to the bindModel handler.
 * It tests that the model binding to-be-established refers to valid model material
 * in the Nexus component tree, and terminates the HTTP handshake process with a 404
 * if not.
 */
fluid.defaults("fluid.nexus.targetComponentBinder", {
    gradeNames: ["kettle.middleware"],
    invokers: {
        "handle": {
            funcName: "fluid.nexus.targetComponentBinder.handle",
            args: ["{arguments}.0",
                "{arguments}.0.req.params.componentPath",
                "{arguments}.0.req.params.modelPath",
                "{fluid.nexus}.nexusComponentRoot"]
        }
    }
});

fluid.nexus.targetComponentBinder.handle = function (that, componentPath, modelPath, componentRoot) {
    var togo = fluid.promise();
    that.componentHolder.targetComponent = fluid.nexus.componentForPathInContainer(componentRoot, componentPath);
    // TODO: Note that applier.modelchanged.addListener is different from https://wiki.fluidproject.org/display/fluid/Nexus+API
    //       Which says applier.addModelListener
    // if the modelPath is undefined, the binding is to the entire model
    modelPath = modelPath || "";
    that.modelPathSegs = fluid.pathUtil.parseEL(modelPath);

    // TODO: I should test that binding to non-extant model on an extant component is handled correctly, i.e. by writing that model material onto the component
    if (that.componentHolder.targetComponent !== undefined) {
        togo.resolve();
    } else {
        togo.reject({
            isError: true,
            statusCode: 404,
            message: "No model material at path " + componentPath + modelPath ? "." + modelPath : ""
        });
    }
    return togo;
};

fluid.defaults("fluid.nexus.bindModel.handler", {
    gradeNames: ["kettle.request.ws", "fluid.nexus.targetComponentBinder"],
    requestMiddleware: {
        "bindTargetComponent": {
            middleware: "{fluid.nexus}.bindModelTargetComponentBinder"
        }
    },
    members: {
        // We store the targetComponent inside a container so that the
        // component is isolated from IoC references. This will not be
        // necessary in the future after upcoming framework changes
        // are completed.
        // See https://issues.fluidproject.org/browse/FLUID-4925
        componentHolder: {
            targetComponent: null // Will be set during our cunning middleware targetComponentBinder
        },
        modelPathSegs: null, // Will be set at onBindWs
        targetModelChangeListenerId: null // Will be set at onBindWs
    },
    invokers: {
        targetModelChangeListener: {
            funcName: "fluid.nexus.bindModel.targetModelChangeListener",
            args: [
                "{that}",
                "{arguments}.0" // value
            ]
        }
    },
    listeners: {
        onBindWs: {
            funcName: "fluid.nexus.bindModel.bindWs",
            args: [
                "{that}",
                "{that}.targetModelChangeListener"
            ]
        },
        onReceiveMessage: {
            funcName: "fluid.nexus.bindModel.receiveMessage",
            args: [
                "{that}.componentHolder.targetComponent",
                "{that}.modelPathSegs",
                "{arguments}.1" // message
            ]
        },
        onDestroy: {
            "this": "{that}.componentHolder.targetComponent.applier.modelChanged",
            method: "removeListener",
            args: ["{that}.targetModelChangeListenerId"]
        }
    }
});

// TODO: do not crash when componentPath does not map to an existing component
fluid.nexus.bindModel.bindWs = function (that, modelChangeListener) {
    that.targetModelChangeListenerId = fluid.allocateGuid();
    that.componentHolder.targetComponent.applier.modelChanged.addListener(
        {
            segs: that.modelPathSegs,
            listenerId: that.targetModelChangeListenerId
        },
        modelChangeListener
    ); // TODO: namespace?

    // On connect, send a message with the state of the component's model at modelPath
    that.sendMessage(fluid.get(that.componentHolder.targetComponent.model, that.modelPathSegs));
};

fluid.nexus.bindModel.targetModelChangeListener = function (that, value) {
    that.sendMessage(value);
};

// TODO: the whole Nexus should not crash because it receives a bad WebSocket message.
fluid.nexus.bindModel.receiveMessage = function (component, baseModelPathSegs, message) {
    if (message.path === undefined || message.value === undefined) {
        return;
    };
    var messagePathSegs = fluid.pathUtil.parseEL(message.path);
    var changePathSegs = baseModelPathSegs.concat(messagePathSegs);
    component.applier.fireChangeRequest(
        {
            segs: changePathSegs,
            value: message.value,
            type: message.type
        }
    );
};
