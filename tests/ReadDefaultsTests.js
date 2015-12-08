"use strict";

var fluid = require("infusion"),
    gpii = fluid.registerNamespace("gpii"),
    jqUnit = fluid.require("node-jqunit"),
    kettle = fluid.registerNamespace("kettle"),
    path = require("path"),
    configPath = path.resolve(__dirname, "..");

require("kettle");
require("../src/Nexus.js");

kettle.loadTestingSupport();

fluid.defaults("gpii.tests.nexus.testGrade", {
    gradeNames: ["fluid.component"]
});

gpii.tests.nexus.verifyReadDefaultsResponse = function (data, expectedGradeNames) {
    var responseGradeSpec = JSON.parse(data);
    fluid.each(expectedGradeNames, function (gradeName) {
        jqUnit.assertTrue("Read Defaults response has grade " + gradeName,
                          fluid.hasGrade(responseGradeSpec, gradeName));
    });
};

gpii.tests.nexus.testDefs = [
    {
        name: "Nexus Read Defaults tests",
        gradeNames: "kettle.test.testCaseHolder",
        expect: 2,
        config: {
            configName: "gpii.nexus.config",
            configPath: configPath
        },
        testGradeName: "gpii.tests.nexus.testGrade",
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
        },
        sequence: [
            {
                func: "{readDefaultsRequest}.send"
            },
            {
                event: "{readDefaultsRequest}.events.onComplete",
                listener: "gpii.tests.nexus.verifyReadDefaultsResponse",
                args: ["{arguments}.0", ["fluid.component", "gpii.tests.nexus.testGrade"]]
            }
        ]
    }
];


// TODO: Resubmit a read defaults response to the write defaults endpoint and verify idempotent


kettle.test.bootstrapServer(gpii.tests.nexus.testDefs);
