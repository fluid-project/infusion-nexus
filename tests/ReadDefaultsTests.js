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

fluid.defaults("gpii.tests.nexus.readDefaults.testGrade", {
    gradeNames: ["fluid.component"]
});

gpii.tests.nexus.readDefaults.testDefs = [
    {
        name: "Read Defaults for existing grade",
        gradeNames: "gpii.test.nexus.testCaseHolder",
        expect: 4,
        config: {
            configName: "gpii.nexus.config",
            configPath: configPath
        },
        testGradeName: "gpii.tests.nexus.readDefaults.testGrade",
        sequence: [
            {
                func: "{readDefaultsRequest}.send"
            },
            {
                event: "{readDefaultsRequest}.events.onComplete",
                listener: "gpii.test.nexus.verifyReadDefaultsResponse",
                args: ["{arguments}.0", "{readDefaultsRequest}", ["fluid.component", "gpii.tests.nexus.readDefaults.testGrade"]]
            }
        ]
    },
    {
        name: "Read Defaults for non-existing grade",
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

kettle.test.bootstrapServer(gpii.tests.nexus.readDefaults.testDefs);
