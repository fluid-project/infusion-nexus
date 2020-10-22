/*
Copyright 2015, 2016 OCAD University

Licensed under the New BSD license. You may not use this file except in
compliance with this License.

You may obtain a copy of the License at
https://raw.githubusercontent.com/fluid-project/infusion-nexus/main/LICENSE.txt
*/

/* eslint-env node */

"use strict";

var fluid = require("infusion"),
    kettle = require("kettle");

require("../index.js");
require("../src/test/nexusTestUtils.js");

kettle.loadTestingSupport();

fluid.registerNamespace("fluid.tests.nexus.bindModel.happyPath");

fluid.tests.nexus.bindModel.componentOptions = {
    type: "fluid.modelComponent",
    model: {
        "model.path\\seg1": {
            "model.path\\seg2": {
                "model.path\\seg3": "hello"
            }
        }
    }
};

fluid.tests.nexus.bindModel.registerModelListenerForPath = function (componentRoot, componentPath, modelPath, event) {
    var component = fluid.nexus.componentForPathInContainer(componentRoot, componentPath);
    component.applier.modelChanged.addListener(modelPath, event.fire);
};

// TODO: Test with multiple connected WebSocket clients

// Note that these tests verify steps by peeking into the Nexus internal
// state. This is done by making the nexusComponentRoot addressable by
// giving it the grades "fluid.tests.nexus.componentRoot" and
// "fluid.resolveRoot" in the test Kettle app config.

fluid.tests.nexus.bindModel.happyPath.testDefs = [
    {
        name: "Bind Model Happy Path",
        gradeNames: "fluid.test.nexus.testCaseHolder",
        expect: 16,
        config: {
            configName: "fluid.tests.nexus.config",
            configPath: "%infusion-nexus/tests/configs"
        },
        testComponentPath: "nexusBindModelTestComponent",
        testModelPath: "model\\.path\\\\seg1.model\\.path\\\\seg2",
        components: {
            clientWithModelPath: {
                type: "fluid.tests.nexus.bindModel.wsClient",
                options: {
                    termMap: {
                        componentPath: "{tests}.options.testComponentPath",
                        modelPath: "{tests}.options.testModelPath"
                    }
                }
            },
            clientWithoutModelPath: {
                type: "fluid.tests.nexus.bindModel.wsClient",
                options: {
                    termMap: {
                        componentPath: "{tests}.options.testComponentPath",
                        modelPath: ""
                    }
                }
            }
        },
        events: {
            targetModelChanged: null
        },
        sequence: [
            {
                func: "fluid.test.nexus.assertNoComponentAtPath",
                args: [
                    "Component not yet constructed",
                    "{fluid.tests.nexus.componentRoot}",
                    "{tests}.options.testComponentPath"
                ]
            },
            {
                func: "{constructComponentRequest1}.send",
                args: [fluid.tests.nexus.bindModel.componentOptions]
            },
            {
                event: "{constructComponentRequest1}.events.onComplete",
                listener: "fluid.test.nexus.assertHTTPResponse",
                args: ["{arguments}.0", "{constructComponentRequest1}", {
                    statusCode: 201,
                    headers: {
                        "content-type": fluid.NO_VALUE,
                        "content-length": 0
                    },
                    responseBody: fluid.NO_VALUE
                }]
            },
            {
                func: "fluid.tests.nexus.bindModel.registerModelListenerForPath",
                args: [
                    "{fluid.tests.nexus.componentRoot}",
                    "{tests}.options.testComponentPath",
                    "{tests}.options.testModelPath",
                    "{testCaseHolder}.events.targetModelChanged"
                ]
            },
            {
                func: "{clientWithModelPath}.connect"
            },
            {
                event: "{clientWithModelPath}.events.onConnect",
                listener: "fluid.identity"
            },
            {
                event: "{clientWithModelPath}.events.onReceiveMessage",
                listener: "jqUnit.assertDeepEq",
                args: [
                    "Received initial message with the state of the component's model",
                    {
                        type: "initModel",
                        payload: {
                            "model.path\\seg3": "hello"
                        }
                    },
                    "{arguments}.0"
                ]
            },
            // connect and disconnect the client without a model path
            {
                func: "{clientWithoutModelPath}.connect"
            },
            {
                event: "{clientWithoutModelPath}.events.onConnect",
                listener: "fluid.identity"
            },
            {
                event: "{clientWithoutModelPath}.events.onReceiveMessage",
                listener: "jqUnit.assertDeepEq",
                args: [
                    "Received initial message with the state of the component's model",
                    {
                        type: "initModel",
                        payload: {
                            "model.path\\seg1": {
                                "model.path\\seg2": {
                                    "model.path\\seg3": "hello"
                                }
                            }
                        }
                    },
                    "{arguments}.0"
                ]
            },
            {
                func: "{clientWithoutModelPath}.disconnect"
            },
            // Change at path with one segment
            {
                func: "{clientWithModelPath}.send",
                args: [
                    {
                        path: "model\\.path\\\\seg3a",
                        value: "change at path with one segment"
                    }
                ]
            },
            {
                event: "{testCaseHolder}.events.targetModelChanged",
                listener: "fluid.test.nexus.assertComponentModel",
                args: [
                    "Model updated",
                    "{fluid.tests.nexus.componentRoot}",
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
                event: "{clientWithModelPath}.events.onReceiveMessage",
                listener: "jqUnit.assertDeepEq",
                args: [
                    "Received change message",
                    {
                        type: "modelChanged",
                        payload: {
                            "model.path\\seg3": "hello",
                            "model.path\\seg3a": "change at path with one segment"
                        }
                    },
                    "{arguments}.0"
                ]
            },
            // Change at path with two segments
            {
                func: "{clientWithModelPath}.send",
                args: [
                    {
                        path: "model\\.path\\\\seg3b.model\\.path\\\\seg4",
                        value: "change at path with two segments"
                    }
                ]
            },
            {
                event: "{testCaseHolder}.events.targetModelChanged",
                listener: "fluid.test.nexus.assertComponentModel",
                args: [
                    "Model updated",
                    "{fluid.tests.nexus.componentRoot}",
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
                event: "{clientWithModelPath}.events.onReceiveMessage",
                listener: "jqUnit.assertDeepEq",
                args: [
                    "Received change message",
                    {
                        type: "modelChanged",
                        payload: {
                            "model.path\\seg3": "hello",
                            "model.path\\seg3a": "change at path with one segment",
                            "model.path\\seg3b": {
                                "model.path\\seg4": "change at path with two segments"
                            }
                        }
                    },
                    "{arguments}.0"
                ]
            },
            // Change at path with no segments
            {
                func: "{clientWithModelPath}.send",
                args: [
                    {
                        path: "",
                        value: "change at path with no segments"
                    }
                ]
            },
            {
                event: "{testCaseHolder}.events.targetModelChanged",
                listener: "fluid.test.nexus.assertComponentModel",
                args: [
                    "Model updated",
                    "{fluid.tests.nexus.componentRoot}",
                    "{tests}.options.testComponentPath",
                    {
                        "model.path\\seg1": {
                            "model.path\\seg2": "change at path with no segments"
                        }
                    }
                ]
            },
            {
                event: "{clientWithModelPath}.events.onReceiveMessage",
                listener: "jqUnit.assertDeepEq",
                args: [
                    "Received change message",
                    {
                        type: "modelChanged",
                        payload: "change at path with no segments"
                    },
                    "{arguments}.0"
                ]
            },
            // Disconnect
            {
                func: "{clientWithModelPath}.disconnect"
            }
        ]
    }
];

kettle.test.bootstrapServer(fluid.tests.nexus.bindModel.happyPath.testDefs);
