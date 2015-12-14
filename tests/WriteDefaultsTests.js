"use strict";

var fluid = require("infusion"),
    gpii = fluid.registerNamespace("gpii"),
    kettle = fluid.registerNamespace("kettle"),
    path = require("path"),
    configPath = path.resolve(__dirname, "../configs");

require("kettle");
require("../src/Nexus.js");
require("../src/test/NexusTestUtils.js");

kettle.loadTestingSupport();

fluid.registerNamespace("gpii.tests.nexus.writeDefaults");

gpii.tests.nexus.writeDefaults.newGradeOptions = {
    gradeNames: ["fluid.component"]
};

gpii.tests.nexus.writeDefaults.testDefs = [
    {
        name: "Write Defaults with good grade options",
        gradeNames: "gpii.test.nexus.testCaseHolder",
        expect: 8,
        config: {
            configName: "gpii.nexus.config",
            configPath: configPath
        },
        testGradeName: "gpii.tests.nexus.writeDefaults.newGrade",
        components: {
            readDefaultsAgainRequest: {
                type: "kettle.test.request.http",
                options: {
                    path: "/defaults/%gradeName",
                    port: 8081,
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
            configName: "gpii.nexus.config",
            configPath: configPath
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

                    // TODO: Maybe "Bad request" rather than "Unknown error"

                    // The "Unknown error" default message is set in
                    // kettle.request.http.errorHandler and I believe
                    // that in this case, the error originates from
                    // Express body-parser middleware
                    // (body-parser/lib/read.js). Which, I think,
                    // means that we would need some default messages
                    // in kettle.request.http.errorHandler for
                    // different status codes.

                    errorTexts: "Unknown error",
                    string: "{arguments}.0",
                    request: "{writeDefaultsRequest}",
                    statusCode: 400
                }]
            }
        ]
    }
];


// TODO: Resubmit a read defaults response to the write defaults endpoint and verify idempotent


kettle.test.bootstrapServer(gpii.tests.nexus.writeDefaults.testDefs);
