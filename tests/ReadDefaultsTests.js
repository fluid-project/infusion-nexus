"use strict";

var fluid = require("infusion"),
    gpii = fluid.registerNamespace("gpii"),
    jqUnit = fluid.require("node-jqunit"),
    kettle = fluid.registerNamespace("kettle"),
    path = require("path"),
    configPath = path.resolve(__dirname, "../configs");

require("kettle");
require("../src/Nexus.js");

kettle.loadTestingSupport();

fluid.defaults("gpii.tests.nexus.testGrade", {
    gradeNames: ["fluid.component"]
});

gpii.tests.nexus.verifyReadDefaultsResponse = function (body, request, expectedGradeNames) {
    // TODO: Switch over to kettle.test.assertJSONResponse
    var responseGradeSpec = JSON.parse(body);
    var response = request.nativeResponse;
    jqUnit.assertEquals("Response has 200 status code", 200, response.statusCode);
    jqUnit.assertTrue("Response has JSON content-type",
                      response.headers["content-type"].indexOf("application/json") === 0);
    fluid.each(expectedGradeNames, function (gradeName) {
        jqUnit.assertTrue("Read Defaults response has grade " + gradeName,
                          fluid.hasGrade(responseGradeSpec, gradeName));
    });
};

fluid.defaults("gpii.test.nexus.testCaseHolder", {
    gradeNames: "kettle.test.testCaseHolder",
    components: {
        readDefaultsRequest: {
            type: "kettle.test.request.http",
            options: {
                path: "/defaults/%gradeName",
                port: 8081,
                termMap: {
                    gradeName: "{tests}.options.testGradeName"
                }
            }
        }
    }
});

gpii.tests.nexus.testDefs = [
    {
        name: "Nexus Read Defaults for existing grade",
        gradeNames: "gpii.test.nexus.testCaseHolder",
        expect: 4,
        config: {
            configName: "gpii.nexus.config",
            configPath: configPath
        },
        testGradeName: "gpii.tests.nexus.testGrade",
        sequence: [
            {
                func: "{readDefaultsRequest}.send"
            },
            {
                event: "{readDefaultsRequest}.events.onComplete",
                listener: "gpii.tests.nexus.verifyReadDefaultsResponse",
                args: ["{arguments}.0", "{readDefaultsRequest}", ["fluid.component", "gpii.tests.nexus.testGrade"]]
            }
        ]
    },
    {
        name: "Nexus Read Defaults for non-existing grade",
        gradeNames: "gpii.test.nexus.testCaseHolder",
        expect: 3,
        config: {
            configName: "gpii.nexus.config",
            configPath: configPath
        },
        testGradeName: "gpii.tests.nexus.nonExistingGrade",
        sequence: [
            {
                func: "{readDefaultsRequest}.send"
            },
            {
                event: "{readDefaultsRequest}.events.onComplete",
                listener: "kettle.test.assertErrorResponse",
                args: [{
                    message: "Read Defaults for non-existing grade returns 404",
                    errorTexts: "Grade not found",
                    string: "{arguments}.0",
                    request: "{readDefaultsRequest}",
                    statusCode: 404
                }]
            }
        ]
    }
];


// TODO: Resubmit a read defaults response to the write defaults endpoint and verify idempotent


kettle.test.bootstrapServer(gpii.tests.nexus.testDefs);
