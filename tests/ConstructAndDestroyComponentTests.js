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

fluid.registerNamespace("gpii.tests.nexus.constructComponent");

gpii.tests.nexus.constructComponent.componentOptions1 = {
    type: "fluid.modelComponent",
    model: {
        "some.model\\path": "one"
    }
};

gpii.tests.nexus.constructComponent.componentOptions2 = {
    type: "fluid.modelComponent",
    model: {
        "some.model\\path": "two"
    }
};

// Note that these tests verify steps by peeking into the Nexus internal
// state. This is done by making the nexusComponentRoot addressable by
// giving it the grades "gpii.tests.nexus.componentRoot" and
// "fluid.resolveRoot" in the test Kettle app config.

gpii.tests.nexus.constructComponent.testDefs = [
    {
        name: "Construct and Destroy Components",
        gradeNames: "gpii.test.nexus.testCaseHolder",
        expect: 17,
        config: {
            configName: "gpii.tests.nexus.config",
            configPath: "%gpii-nexus/tests/configs"
        },
        testComponentPath: "nexusConstructTestsComponentOne",
        testComponentName2: "nexusConstructTestsComponentTwo",
        testComponentPath2: {
            expander: {
                func: "fluid.stringTemplate",
                args: [
                    "%parent.%child",
                    {
                        parent: "{tests}.options.testComponentPath",
                        child: "{tests}.options.testComponentName2"
                    }
                ]
            }
        },
        sequence: [
            {
                func: "gpii.test.nexus.assertNoComponentAtPath",
                args: [
                    "Component not yet constructed",
                    "{gpii.tests.nexus.componentRoot}",
                    "{tests}.options.testComponentPath"
                ]
            },
            {
                func: "gpii.test.nexus.assertNoComponentAtPath",
                args: [
                    "Component not yet constructed",
                    "{gpii.tests.nexus.componentRoot}",
                    "{tests}.options.testComponentPath2"
                ]
            },
            // Construct component one
            {
                func: "{constructComponentRequest}.send",
                args: [gpii.tests.nexus.constructComponent.componentOptions1]
            },
            {
                event: "{constructComponentRequest}.events.onComplete",
                listener: "gpii.test.nexus.assertStatusCode",
                args: ["{constructComponentRequest}", 200]
            },
            {
                func: "gpii.test.nexus.assertComponentModel",
                args: [
                    "Model is as expected",
                    "{gpii.tests.nexus.componentRoot}",
                    "{tests}.options.testComponentPath",
                    gpii.tests.nexus.constructComponent.componentOptions1.model
                ]
            },
            // Construct component two
            {
                func: "gpii.test.nexus.assertNotContainsComponent",
                args: [
                    "{gpii.tests.nexus.componentRoot}",
                    "{tests}.options.testComponentPath",
                    "{tests}.options.testComponentName2"
                ]
            },
            {
                func: "{constructComponentRequest2}.send",
                args: [gpii.tests.nexus.constructComponent.componentOptions2]
            },
            {
                event: "{constructComponentRequest2}.events.onComplete",
                listener: "gpii.test.nexus.assertStatusCode",
                args: ["{constructComponentRequest2}", 200]
            },
            {
                func: "gpii.test.nexus.assertComponentModel",
                args: [
                    "Model is as expected",
                    "{gpii.tests.nexus.componentRoot}",
                    "{tests}.options.testComponentPath2",
                    gpii.tests.nexus.constructComponent.componentOptions2.model
                ]
            },
            {
                func: "gpii.test.nexus.assertContainsComponent",
                args: [
                    "{gpii.tests.nexus.componentRoot}",
                    "{tests}.options.testComponentPath",
                    "{tests}.options.testComponentName2"
                ]
            },
            // Destroy component two
            {
                func: "{destroyComponentRequest2}.send"
            },
            {
                event: "{destroyComponentRequest2}.events.onComplete",
                listener: "gpii.test.nexus.assertStatusCode",
                args: ["{destroyComponentRequest2}", 200]
            },
            {
                func: "gpii.test.nexus.assertNoComponentAtPath",
                args: [
                    "Component has been destroyed",
                    "{gpii.tests.nexus.componentRoot}",
                    "{tests}.options.testComponentPath2"
                ]
            },
            {
                func: "gpii.test.nexus.assertNotContainsComponent",
                args: [
                    "{gpii.tests.nexus.componentRoot}",
                    "{tests}.options.testComponentPath",
                    "{tests}.options.testComponentName2"
                ]
            },
            // Destroy component one
            {
                func: "gpii.test.nexus.assertComponentModel",
                args: [
                    "Model is as expected",
                    "{gpii.tests.nexus.componentRoot}",
                    "{tests}.options.testComponentPath",
                    gpii.tests.nexus.constructComponent.componentOptions1.model
                ]
            },
            {
                func: "{destroyComponentRequest}.send"
            },
            {
                event: "{destroyComponentRequest}.events.onComplete",
                listener: "gpii.test.nexus.assertStatusCode",
                args: ["{destroyComponentRequest}", 200]
            },
            {
                func: "gpii.test.nexus.assertNoComponentAtPath",
                args: [
                    "Component has been destroyed",
                    "{gpii.tests.nexus.componentRoot}",
                    "{tests}.options.testComponentPath"
                ]
            }
        ]
    }
];

kettle.test.bootstrapServer(gpii.tests.nexus.constructComponent.testDefs);
