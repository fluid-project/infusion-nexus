/*
Copyright 2015, 2016 OCAD University

Licensed under the New BSD license. You may not use this file except in
compliance with this License.

You may obtain a copy of the License at
https://raw.githubusercontent.com/GPII/nexus/master/LICENSE.txt
*/

/* eslint-env node */

"use strict";

var fluid = require("infusion"),
    kettle = require("kettle"),
    gpii = fluid.registerNamespace("gpii");

require("../index.js");
require("../src/test/NexusTestUtils.js");

kettle.loadTestingSupport();

fluid.defaults("gpii.tests.nexus.readDefaults.testGrade", {
    gradeNames: ["fluid.component"],
    model: {
        name1: "hello world"
    }
});

gpii.tests.nexus.readDefaults.testDefs = [
    {
        name: "Read Defaults for existing grade",
        gradeNames: "gpii.test.nexus.testCaseHolder",
        expect: 3,
        config: {
            configName: "gpii.tests.nexus.config",
            configPath: "%gpii-nexus/tests/configs"
        },
        testGradeName: "gpii.tests.nexus.readDefaults.testGrade",
        sequence: [
            {
                func: "{readDefaultsRequest}.send"
            },
            {
                event: "{readDefaultsRequest}.events.onComplete",
                listener: "gpii.test.nexus.verifyReadDefaultsResponse",
                args: [
                    "{arguments}.0",
                    "{readDefaultsRequest}",
                    {
                        gradeNames: ["fluid.component", "gpii.tests.nexus.readDefaults.testGrade"],
                        model: {
                            name1: "hello world"
                        }
                    }
                ]
            }
        ]
    },
    {
        name: "Read Defaults for non-existing grade",
        gradeNames: "gpii.test.nexus.testCaseHolder",
        expect: 3,
        config: {
            configName: "gpii.tests.nexus.config",
            configPath: "%gpii-nexus/tests/configs"
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
