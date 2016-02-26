"use strict";

var fluid = require("infusion"),
    gpii = fluid.registerNamespace("gpii"),
    kettle = fluid.registerNamespace("kettle"),
    path = require("path"),
    configPath = path.resolve(__dirname, "configs");

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
            configName: "gpii.tests.nexus.config",
            configPath: configPath
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
                    // kettle.request.http.errorHandler and in this
                    // case, the error originates from Express
                    // body-parser middleware
                    // (body-parser/lib/read.js). We should implement
                    // a replacement JSON parsing middleware based on
                    // kettle.JSON.parse(), with richer error
                    // reporting. For documentation on middleware in
                    // Kettle, see
                    // https://github.com/amb26/kettle/blob/KETTLE-32/README.md#working-with-middleware

                    errorTexts: "Unknown error",
                    string: "{arguments}.0",
                    request: "{writeDefaultsRequest}",
                    statusCode: 400
                }]
            }
        ]
    }
];


// TODO: Test sending a badly-formed grade definition (bad compact invoker)

// To implement testing of badly-formed grade definition, we will need
// to replace the default Kettle run-time and test-time fluid.fail()
// error handling. The default fail handlers cause the current Kettle
// request to be rejected and the current test to be failed.
//
// Fail handlers are managed with Infusion event listeners. Each
// namespaced listener has a stack of handlers -- the one at the top
// is active. If the stack is popped, the top one is removed and the
// next below becomes active.
//
// For the Kettle run-time Write Defaults request handler, we will:
//
// - addListener to failureEvent.fail with function fluid.identity
//   (push a NOP handler onto the top of the stack)
// - try fluid.defaults()
// - catch exception, if instanceof fluid.FluidError, 400, otherwise 500
// - finally removeListener failureEvent.fail (revert back to default handler)
//
// And similarly for the test-time fail handler.
//
// See:
//
// - https://github.com/amb26/kettle/blob/KETTLE-32/tests/ErrorTests.js#L220
// - https://github.com/amb26/kettle/blob/KETTLE-32/lib/test/KettleTestUtils.js#L87
// - https://github.com/fluid-project/infusion/blob/master/tests/test-core/jqUnit/js/jqUnit.js#L264

/*
gpii.tests.nexus.writeDefaults.badlyFormedInvokerGradeOptions = {
    gradeNames: ["fluid.component"],
    invokers: {
        invoker1: "bad("
    }
};

gpii.tests.nexus.writeDefaults.sendBadlyFormedInvokerGradeOptions = function (request) {
    request.send(gpii.tests.nexus.writeDefaults.badlyFormedInvokerGradeOptions);
};

    {
        name: "Write Defaults with badly formed grade",
        gradeNames: "gpii.test.nexus.testCaseHolder",
        expect: 3,
        config: {
            configName: "gpii.tests.nexus.config",
            configPath: configPath
        },
        testGradeName: "gpii.tests.nexus.writeDefaults.badlyFormedInvoker",
        sequence: [
            {
                func: "gpii.tests.nexus.writeDefaults.sendBadlyFormedInvokerGradeOptions",
                args: ["{writeDefaultsRequest}"]
            },
            {
                event: "{writeDefaultsRequest}.events.onComplete",
                listener: "kettle.test.assertErrorResponse",
                args: [{
                    message: "Write Defaults returns 400 for badly formed grade",
                    errorTexts: "Badly-formed compact invoker record",
                    string: "{arguments}.0",
                    request: "{writeDefaultsRequest}",
                    statusCode: 400
                }]
            }
        ]
    }
*/


// TODO: Resubmit a read defaults response to the write defaults endpoint and verify idempotent


kettle.test.bootstrapServer(gpii.tests.nexus.writeDefaults.testDefs);
