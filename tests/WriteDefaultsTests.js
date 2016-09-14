/*
Copyright 2015, 2016 OCAD University

Licensed under the New BSD license. You may not use this file except in
compliance with this License.

You may obtain a copy of the License at
https://raw.githubusercontent.com/GPII/nexus/master/LICENSE.txt
*/

/* global JSON */

"use strict";

var fluid = require("infusion"),
    kettle = require("kettle"),
    gpii = fluid.registerNamespace("gpii");

require("../index.js");
require("../src/test/NexusTestUtils.js");

kettle.loadTestingSupport();

fluid.registerNamespace("gpii.tests.nexus.writeDefaults");

gpii.tests.nexus.writeDefaults.newGradeOptions = {
    gradeNames: ["fluid.component"],
    model: {
        name1: "hello world"
    }
};

gpii.tests.nexus.writeDefaults.updatedGradeOptions = {
    gradeNames: ["fluid.component"],
    model: {
        updatedGrade: true
    }
};

gpii.tests.nexus.writeDefaults.badlyFormedInvokerGradeOptions = {
    gradeNames: ["fluid.component"],
    invokers: {
        invoker1: "bad("
    }
};

gpii.tests.nexus.writeDefaults.sendBadlyFormedInvokerGradeOptions = function (request) {
    request.send(gpii.tests.nexus.writeDefaults.badlyFormedInvokerGradeOptions);
};

gpii.tests.nexus.writeDefaults.rememberReadDefaultsResponse = function (body, component) {
    component.readDefaultsResponseBody = body;
    component.readDefaultsResponseGradeSpec = JSON.parse(body);
};

gpii.tests.nexus.writeDefaults.testDefs = [
    {
        name: "Write Defaults with good grade options and verify update to the grade",
        gradeNames: "gpii.test.nexus.testCaseHolder",
        expect: 11,
        config: {
            configName: "gpii.tests.nexus.config",
            configPath: "%gpii-nexus/tests/configs"
        },
        testGradeName: "gpii.tests.nexus.writeDefaults.newGrade",
        sequence: [
            {
                func: "{readDefaultsRequest}.send"
            },
            {
                event: "{readDefaultsRequest}.events.onComplete",
                listener: "kettle.test.assertErrorResponse",
                args: [{
                    message: "Read Defaults returns 404 as we haven't created the new grade yet",
                    errorTexts: "Grade not found",
                    string: "{arguments}.0",
                    request: "{readDefaultsRequest}",
                    statusCode: 404
                }]
            },
            {
                func: "{writeDefaultsRequest}.send",
                args: [gpii.tests.nexus.writeDefaults.newGradeOptions]
            },
            {
                event: "{writeDefaultsRequest}.events.onComplete",
                listener: "gpii.test.nexus.assertStatusCode",
                args: ["{writeDefaultsRequest}", 200]
            },
            {
                func: "{readDefaultsSecondTimeRequest}.send"
            },
            {
                event: "{readDefaultsSecondTimeRequest}.events.onComplete",
                listener: "gpii.test.nexus.verifyReadDefaultsResponse",
                args: [
                    "{arguments}.0",
                    "{readDefaultsSecondTimeRequest}",
                    {
                        gradeNames: ["fluid.component", "gpii.tests.nexus.writeDefaults.newGrade"],
                        model: {
                            name1: "hello world"
                        }
                    }
                ]
            },
            {
                func: "{writeDefaultsAgainRequest}.send",
                args: [gpii.tests.nexus.writeDefaults.updatedGradeOptions]
            },
            {
                event: "{writeDefaultsAgainRequest}.events.onComplete",
                listener: "gpii.test.nexus.assertStatusCode",
                args: ["{writeDefaultsAgainRequest}", 200]
            },
            {
                func: "{readDefaultsThirdTimeRequest}.send"
            },
            {
                event: "{readDefaultsThirdTimeRequest}.events.onComplete",
                listener: "gpii.test.nexus.verifyReadDefaultsResponse",
                args: [
                    "{arguments}.0",
                    "{readDefaultsThirdTimeRequest}",
                    {
                        gradeNames: ["fluid.component", "gpii.tests.nexus.writeDefaults.newGrade"],
                        model: {
                            updatedGrade: true
                        }
                    }
                ]
            }
        ]
    },
    {
        name: "Write Defaults with badly formed JSON",
        gradeNames: "gpii.test.nexus.testCaseHolder",
        expect: 3,
        config: {
            configName: "gpii.tests.nexus.config",
            configPath: "%gpii-nexus/tests/configs"
        },
        testGradeName: "gpii.tests.nexus.writeDefaults.badlyFormedJson",
        sequence: [
            {
                func: "{writeDefaultsRequest}.send",
                args: [
                    "{",
                    {
                        headers: {
                            "Content-Type": "application/json"
                        }
                    }
                ]
            },
            {
                event: "{writeDefaultsRequest}.events.onComplete",
                listener: "kettle.test.assertErrorResponse",
                args: [{
                    message: "Write Defaults returns 400 for badly formed JSON",
                    errorTexts: "Unexpected end of input",
                    string: "{arguments}.0",
                    request: "{writeDefaultsRequest}",
                    statusCode: 400
                }]
            }
        ]
    },
    {
        name: "Write Defaults with badly formed grade",
        gradeNames: "gpii.test.nexus.testCaseHolder",
        expect: 3,
        config: {
            configName: "gpii.tests.nexus.config",
            configPath: "%gpii-nexus/tests/configs"
        },
        testGradeName: "gpii.tests.nexus.writeDefaults.badlyFormedInvoker",
        sequence: [
            {
                funcName: "kettle.test.pushInstrumentedErrors",
                args: ["fluid.identity"]
            },
            {
                funcName: "gpii.tests.nexus.writeDefaults.sendBadlyFormedInvokerGradeOptions",
                args: ["{writeDefaultsRequest}"]
            },
            {
                event: "{writeDefaultsRequest}.events.onComplete",
                listener: "kettle.test.assertErrorResponse",
                args: [{
                    message: "Write Defaults returns 500 for badly formed grade",
                    errorTexts: "Badly-formed compact invoker record without matching parentheses: bad(",
                    string: "{arguments}.0",
                    request: "{writeDefaultsRequest}",
                    statusCode: 500
                }]
            },
            {
                funcName: "kettle.test.popInstrumentedErrors"
            }
        ]
    },
    {
        name: "Send a Read Defaults response back to Write Defaults and verify that the grade is stable",
        gradeNames: "gpii.test.nexus.testCaseHolder",
        expect: 8,
        config: {
            configName: "gpii.tests.nexus.config",
            configPath: "%gpii-nexus/tests/configs"
        },
        testGradeName: "gpii.tests.nexus.writeDefaults.newGrade",
        sequence: [
            {
                func: "{writeDefaultsRequest}.send",
                args: [gpii.tests.nexus.writeDefaults.newGradeOptions]
            },
            {
                event: "{writeDefaultsRequest}.events.onComplete",
                listener: "gpii.test.nexus.assertStatusCode",
                args: ["{writeDefaultsRequest}", 200]
            },
            {
                func: "{readDefaultsRequest}.send"
            },
            {
                event: "{readDefaultsRequest}.events.onComplete",
                listener: "gpii.tests.nexus.writeDefaults.rememberReadDefaultsResponse",
                args: ["{arguments}.0", "{tests}"]
            },
            {
                funcName: "gpii.test.nexus.verifyReadDefaultsResponse",
                args: [
                    "{tests}.readDefaultsResponseBody",
                    "{readDefaultsRequest}",
                    {
                        gradeNames: ["fluid.component", "gpii.tests.nexus.writeDefaults.newGrade"],
                        model: {
                            name1: "hello world"
                        }
                    }
                ]
            },
            {
                func: "{writeDefaultsAgainRequest}.send",
                args: ["{tests}.readDefaultsResponseGradeSpec"]
            },
            {
                event: "{writeDefaultsAgainRequest}.events.onComplete",
                listener: "gpii.test.nexus.assertStatusCode",
                args: ["{writeDefaultsAgainRequest}", 200]
            },
            {
                func: "{readDefaultsSecondTimeRequest}.send"
            },
            {
                event: "{readDefaultsSecondTimeRequest}.events.onComplete",
                listener: "gpii.test.nexus.verifyReadDefaultsResponse",
                args: [
                    "{arguments}.0",
                    "{readDefaultsSecondTimeRequest}",
                    "{tests}.readDefaultsResponseGradeSpec"
                ]
            }
        ]
    }
];

kettle.test.bootstrapServer(gpii.tests.nexus.writeDefaults.testDefs);
