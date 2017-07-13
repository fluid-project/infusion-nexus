/*
Copyright 2015, 2016 OCAD University

Licensed under the New BSD license. You may not use this file except in
compliance with this License.

You may obtain a copy of the License at
https://raw.githubusercontent.com/GPII/nexus/master/LICENSE.txt
*/

/* eslint-env node */

"use strict";

var fluid = require("infusion"),
    kettle = require("kettle"),
    gpii = fluid.registerNamespace("gpii");

require("../index.js");
require("../src/test/NexusTestUtils.js");

kettle.loadTestingSupport();

fluid.registerNamespace("gpii.tests.nexus.bindModel");

gpii.tests.nexus.bindModel.componentOptions = {
    type: "fluid.modelComponent",
    model: {
        "model.path\\seg1": {
            "model.path\\seg2": {
                "model.path\\seg3": "hello"
            }
        }
    }
};

gpii.tests.nexus.bindModel.registerModelListenerForPath = function (nexusComponentRoot,componentPath, modelPath, event) {
    var component = gpii.nexus.componentForPathInContainer(nexusComponentRoot, componentPath);
    component.applier.modelChanged.addListener(modelPath, event.fire);
};

fluid.defaults("gpii.tests.nexus.bindModel.wsClient", {
    gradeNames: "kettle.test.request.ws",
    path: "/bindModel/%componentPath/%modelPath",
    port: "{configuration}.options.serverPort",
    termMap: {
        componentPath: "{tests}.options.testComponentPath",
        modelPath: "{tests}.options.testModelPath"
    }
});

// TODO: Test with multiple connected WebSocket clients

// Note that these tests verify steps by peeking into the Nexus internal
// state. This is done by making the nexusComponentRoot addressable by
// giving it the grades "gpii.tests.nexus.componentRoot" and
// "fluid.resolveRoot" in the test Kettle app config.

gpii.tests.nexus.bindModel.testDefs = [
    {
        name: "Bind Model",
        gradeNames: "gpii.test.nexus.testCaseHolder",
        expect: 12,
        config: {
            configName: "gpii.tests.nexus.config",
            configPath: "%gpii-nexus/tests/configs"
        },
        testComponentPath: "nexusBindModelTestComponent",
        testModelPath: "model\\.path\\\\seg1.model\\.path\\\\seg2",
        components: {
            client: {
                type: "gpii.tests.nexus.bindModel.wsClient"
            }
        },
        events: {
            targetModelChanged: null
        },
        sequence: [
            {
                func: "gpii.test.nexus.assertNoComponentAtPath",
                args: [
                    "Component not yet constructed",
                    "{gpii.tests.nexus.componentRoot}",
                    "{tests}.options.testComponentPath"
                ]
            },
            {
                func: "{constructComponentRequest}.send",
                args: [gpii.tests.nexus.bindModel.componentOptions]
            },
            {
                event: "{constructComponentRequest}.events.onComplete",
                listener: "gpii.test.nexus.assertStatusCode",
                args: ["{constructComponentRequest}", 200]
            },
            {
                func: "gpii.tests.nexus.bindModel.registerModelListenerForPath",
                args: [
                    "{gpii.tests.nexus.componentRoot}",
                    "{tests}.options.testComponentPath",
                    "{tests}.options.testModelPath",
                    "{testCaseHolder}.events.targetModelChanged"
                ]
            },
            {
                func: "{client}.connect"
            },
            {
                event: "{client}.events.onConnect",
                listener: "fluid.identity"
            },
            {
                event: "{client}.events.onReceiveMessage",
                listener: "jqUnit.assertDeepEq",
                args: [
                    "Received initial message with the state of the component's model",
                    {
                        "model.path\\seg3": "hello"
                    },
                    "{arguments}.0"
                ]
            },
            // Change at path with one segment
            {
                func: "{client}.send",
                args: [
                    {
                        path: "model\\.path\\\\seg3a",
                        value: "change at path with one segment"
                    }
                ]
            },
            {
                event: "{testCaseHolder}.events.targetModelChanged",
                listener: "gpii.test.nexus.assertComponentModel",
                args: [
                    "Model updated",
                    "{gpii.tests.nexus.componentRoot}",
                    "{tests}.options.testComponentPath",
                    {
                        "model.path\\seg1": {
                            "model.path\\seg2": {
                                "model.path\\seg3": "hello",
                                "model.path\\seg3a": "change at path with one segment"
                            }
                        }
                    }
                ]
            },
            {
                event: "{client}.events.onReceiveMessage",
                listener: "jqUnit.assertDeepEq",
                args: [
                    "Received change message",
                    {
                        "model.path\\seg3": "hello",
                        "model.path\\seg3a": "change at path with one segment"
                    },
                    "{arguments}.0"
                ]
            },
            // Change at path with two segments
            {
                func: "{client}.send",
                args: [
                    {
                        path: "model\\.path\\\\seg3b.model\\.path\\\\seg4",
                        value: "change at path with two segments"
                    }
                ]
            },
            {
                event: "{testCaseHolder}.events.targetModelChanged",
                listener: "gpii.test.nexus.assertComponentModel",
                args: [
                    "Model updated",
                    "{gpii.tests.nexus.componentRoot}",
                    "{tests}.options.testComponentPath",
                    {
                        "model.path\\seg1": {
                            "model.path\\seg2": {
                                "model.path\\seg3": "hello",
                                "model.path\\seg3a": "change at path with one segment",
                                "model.path\\seg3b": {
                                    "model.path\\seg4": "change at path with two segments"
                                }
                            }
                        }
                    }
                ]
            },
            {
                event: "{client}.events.onReceiveMessage",
                listener: "jqUnit.assertDeepEq",
                args: [
                    "Received change message",
                    {
                        "model.path\\seg3": "hello",
                        "model.path\\seg3a": "change at path with one segment",
                        "model.path\\seg3b": {
                            "model.path\\seg4": "change at path with two segments"
                        }
                    },
                    "{arguments}.0"
                ]
            },
            // Change at path with no segments
            {
                func: "{client}.send",
                args: [
                    {
                        path: "",
                        value: "change at path with no segments"
                    }
                ]
            },
            {
                event: "{testCaseHolder}.events.targetModelChanged",
                listener: "gpii.test.nexus.assertComponentModel",
                args: [
                    "Model updated",
                    "{gpii.tests.nexus.componentRoot}",
                    "{tests}.options.testComponentPath",
                    {
                        "model.path\\seg1": {
                            "model.path\\seg2": "change at path with no segments"
                        }
                    }
                ]
            },
            {
                event: "{client}.events.onReceiveMessage",
                listener: "jqUnit.assertEquals",
                args: ["Received change message", "change at path with no segments", "{arguments}.0"]
            },
            // Disconnect
            {
                func: "{client}.disconnect"
            }
        ]
    }
];

kettle.test.bootstrapServer(gpii.tests.nexus.bindModel.testDefs);
