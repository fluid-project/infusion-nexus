/*
Copyright 2015, 2016 OCAD University

Licensed under the New BSD license. You may not use this file except in
compliance with this License.

You may obtain a copy of the License at
https://raw.githubusercontent.com/GPII/nexus/master/LICENSE.txt
*/

"use strict";

var fluid = require("infusion"),
    kettle = require("kettle"),
    gpii = fluid.registerNamespace("gpii");

require("../index.js");
require("../src/test/NexusTestUtils.js");

kettle.loadTestingSupport();

fluid.registerNamespace("gpii.tests.nexus.writeDefaults");

gpii.tests.nexus.writeDefaults.newGradeOptions = {
    gradeNames: ["fluid.component"]
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

gpii.tests.nexus.writeDefaults.testDefs = [
    {
        name: "Write Defaults with good grade options",
        gradeNames: "gpii.test.nexus.testCaseHolder",
        expect: 8,
        config: {
            configName: "gpii.tests.nexus.config",
            configPath: "%gpii-nexus/tests/configs"
        },
        testGradeName: "gpii.tests.nexus.writeDefaults.newGrade",
        components: {
            readDefaultsAgainRequest: {
                type: "kettle.test.request.http",
                options: {
                    path: "/defaults/%gradeName",
                    port: "{configuration}.options.serverPort",
                    termMap: {
                        gradeName: "{tests}.options.testGradeName"
                    }
                }
            }
        },
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
                func: "{readDefaultsAgainRequest}.send"
            },
            {
                event: "{readDefaultsAgainRequest}.events.onComplete",
                listener: "gpii.test.nexus.verifyReadDefaultsResponse",
                args: ["{arguments}.0", "{readDefaultsAgainRequest}", ["fluid.component", "gpii.tests.nexus.writeDefaults.newGrade"]]
            }

            // TODO: Update the grade definition and verify

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
    }
];


// TODO: Resubmit a read defaults response to the write defaults endpoint and verify idempotent


kettle.test.bootstrapServer(gpii.tests.nexus.writeDefaults.testDefs);
