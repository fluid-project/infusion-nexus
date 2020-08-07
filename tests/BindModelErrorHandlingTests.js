/*
Copyright 2015, 2016 OCAD University

Licensed under the New BSD license. You may not use this file except in
compliance with this License.

You may obtain a copy of the License at
https://raw.githubusercontent.com/fluid-project/infusion-nexus/master/LICENSE.txt
*/

/* eslint-env node */

"use strict";

var fluid = require("infusion"),
    kettle = require("kettle");

require("../index.js");
require("../src/test/nexusTestUtils.js");

kettle.loadTestingSupport();

fluid.registerNamespace("fluid.tests.nexus.bindModel.errorHandling");

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

fluid.defaults("fluid.tests.nexus.bindModel.badlyFormedJson", {
    gradeNames: "fluid.resourceLoader",
    resources: {
        corruptJSON: {
            path: "%infusion-nexus/tests/data/corruptJSONFile.jsonx",
            dataType: "text"
        }
    }
});

fluid.tests.nexus.bindModel.errorHandling.testDefs = [
    {
        name: "Bind Model Error Handling",
        gradeNames: ["fluid.test.nexus.testCaseHolder", "fluid.tests.nexus.bindModel.badlyFormedJson"],
        expect: 18,
        config: {
            configName: "fluid.tests.nexus.config",
            configPath: "%infusion-nexus/tests/configs"
        },
        testComponentPath: "nexusBindModelTestComponent",
        testModelPath: "model\\.path\\\\seg1.model\\.path\\\\seg2",
        components: {
            failingClientWithModelPath: {
                type: "fluid.tests.nexus.bindModel.wsClient",
                options: {
                    termMap: {
                        componentPath: "{tests}.options.testComponentPath",
                        modelPath: "{tests}.options.testModelPath"
                    }
                }
            },
            failingClientWithoutModelPath: {
                type: "fluid.tests.nexus.bindModel.wsClient",
                options: {
                    termMap: {
                        componentPath: "{tests}.options.testComponentPath",
                        modelPath: ""
                    }
                }
            },
            successfulClientWithModelPath: {
                type: "fluid.tests.nexus.bindModel.wsClient",
                options: {
                    termMap: {
                        componentPath: "{tests}.options.testComponentPath",
                        modelPath: "{tests}.options.testModelPath"
                    }
                }
            }
        },
        // TODO: test destroying a component that currently has a bind model connection
        sequence: [
            {
                event: "{badlyFormedJson}.events.onResourcesLoaded",
                listener: "fluid.identity"
            },
            // There is no component at testComponentPath
            {
                func: "fluid.test.nexus.assertNoComponentAtPath",
                args: [
                    "Component not yet constructed",
                    "{fluid.tests.nexus.componentRoot}",
                    "{tests}.options.testComponentPath"
                ]
            },
            // Attempt to connect to the non-existing component without a model path
            {
                func: "{failingClientWithoutModelPath}.connect"
            },
            // The request produces a 404
            {
                event: "{failingClientWithoutModelPath}.events.onError",
                listener: "kettle.test.assertErrorResponse",
                args: [{
                    message: "No model material at path nexusBindModelTestComponent",
                    errorTexts: "HTTP",
                    string: "{arguments}.0",
                    request: "{failingClientWithoutModelPath}",
                    statusCode: 404
                }]
            },
            // Attempt to connect to the non-existing component with a model path
            {
                func: "{failingClientWithModelPath}.connect"
            },
            // The request produces a 404
            {
                event: "{failingClientWithModelPath}.events.onError",
                listener: "kettle.test.assertErrorResponse",
                args: [{
                    message: "No model material at path nexusBindModelTestComponent.model\\.path\\\\seg1.model\\.path\\\\seg2",
                    errorTexts: "HTTP",
                    string: "{arguments}.0",
                    request: "{failingClientWithModelPath}",
                    statusCode: 404
                }]
            },
            // Construct a component at testComponentPath
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
            // Succesfully connect to the component
            {
                func: "{successfulClientWithModelPath}.connect"
            },
            {
                event: "{successfulClientWithModelPath}.events.onConnect",
                listener: "fluid.identity"
            },
            // Receive the initial message
            {
                event: "{successfulClientWithModelPath}.events.onReceiveMessage",
                listener: "jqUnit.assertDeepEq",
                args: [
                    "Received initial model state",
                    {
                        type: "initModel",
                        payload: {
                            "model.path\\seg3": "hello"
                        }
                    },
                    "{arguments}.0"
                ]
            },
            // Send an invalid model update to the component
            {
                func: "{successfulClientWithModelPath}.send",
                args: [
                    {
                        malformed: "valid JSON that does not follow the BindModel API"
                    }
                ]
            },
            // The connection should stay alive and the component should be unchanged
            {
                event: "{successfulClientWithModelPath}.events.onReceiveMessage",
                listener: "jqUnit.assertDeepEq",
                args: [
                    "Ignored first malformed change request",
                    {
                        type: "error",
                        payload: {
                            "model.path\\seg3": "hello"
                        }
                    },
                    "{arguments}.0"
                ]
            },
            {
                func: "fluid.test.nexus.assertComponentModel",
                args: [
                    "Model is unchanged",
                    "{fluid.tests.nexus.componentRoot}",
                    "{tests}.options.testComponentPath",
                    {
                        "model.path\\seg1": {
                            "model.path\\seg2": {
                                "model.path\\seg3": "hello"
                            }
                        }
                    }
                ]
            },
            // Send malformed JSON to the component
            {
                func: "{successfulClientWithModelPath}.send",
                args: ["{badlyFormedJson}.resources.corruptJSON.resourceText"]
            },
            // The connection should stay alive and the component should be unchanged
            {
                event: "{successfulClientWithModelPath}.events.onReceiveMessage",
                listener: "jqUnit.assertDeepEq",
                args: [
                    "Ignored second malformed change request",
                    {
                        type: "error",
                        payload: {
                            "model.path\\seg3": "hello"
                        }
                    },
                    "{arguments}.0"
                ]
            },
            {
                func: "fluid.test.nexus.assertComponentModel",
                args: [
                    "Model is unchanged",
                    "{fluid.tests.nexus.componentRoot}",
                    "{tests}.options.testComponentPath",
                    {
                        "model.path\\seg1": {
                            "model.path\\seg2": {
                                "model.path\\seg3": "hello"
                            }
                        }
                    }
                ]
            },
            // Disconnect
            {
                func: "{successfulClientWithModelPath}.disconnect"
            }
        ]
    }
];

kettle.test.bootstrapServer(fluid.tests.nexus.bindModel.errorHandling.testDefs);
