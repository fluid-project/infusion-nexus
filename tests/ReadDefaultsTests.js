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

gpii.tests.nexus.expectedTestGradeSpec = {
    gradeNames: ["fluid.component", "gpii.tests.nexus.testGrade"],
    initFunction: "fluid.initLittleComponent",
    mergePolicy: {
        members: {
            noexpand: true
        },
        invokers: {
            noexpand: true
        },
        transformOptions: "replace"
    },
    argumentMap: {
        options: 0
    },
    events: {
        onCreate: null,
        onDestroy: null,
        afterDestroy: null
    }
};

gpii.tests.nexus.verifyReadDefaultsResponse = function (data, expectedGradeSpec) {
    jqUnit.assertValue("Expected grade spec has a value", expectedGradeSpec);
    jqUnit.assertDeepEq("Response matches expected grade spec", expectedGradeSpec, JSON.parse(data));
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
                args: ["{arguments}.0", gpii.tests.nexus.expectedTestGradeSpec]
            }
        ]
    }
];

kettle.test.bootstrapServer(gpii.tests.nexus.testDefs);
