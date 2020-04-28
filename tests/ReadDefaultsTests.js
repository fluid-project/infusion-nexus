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

require("../nexusModule.js");
require("../src/test/nexusTestUtils.js");

kettle.loadTestingSupport();

fluid.defaults("fluid.tests.nexus.readDefaults.testGrade", {
    gradeNames: ["fluid.component"],
    model: {
        name1: "hello world"
    }
});

fluid.tests.nexus.readDefaults.testDefs = [
    {
        name: "Read Defaults for existing grade",
        gradeNames: "fluid.test.nexus.testCaseHolder",
        expect: 3,
        config: {
            configName: "fluid.tests.nexus.config",
            configPath: "%infusion-nexus/tests/configs"
        },
        testGradeName: "fluid.tests.nexus.readDefaults.testGrade",
        sequence: [
            {
                func: "{readDefaultsRequest}.send"
            },
            {
                event: "{readDefaultsRequest}.events.onComplete",
                listener: "fluid.test.nexus.verifyReadDefaultsResponse",
                args: [
                    "{arguments}.0",
                    "{readDefaultsRequest}",
                    {
                        gradeNames: ["fluid.component", "fluid.tests.nexus.readDefaults.testGrade"],
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
        gradeNames: "fluid.test.nexus.testCaseHolder",
        expect: 3,
        config: {
            configName: "fluid.tests.nexus.config",
            configPath: "%infusion-nexus/tests/configs"
        },
        testGradeName: "fluid.tests.nexus.nonExistingGrade",
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

kettle.test.bootstrapServer(fluid.tests.nexus.readDefaults.testDefs);
