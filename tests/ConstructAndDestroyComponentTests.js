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

require("../index.js");
require("../src/test/nexusTestUtils.js");

kettle.loadTestingSupport();

fluid.registerNamespace("fluid.tests.nexus.constructComponent");

fluid.tests.nexus.constructComponent.componentOptions1 = {
    type: "fluid.modelComponent",
    model: {
        "some.model\\path": "one"
    }
};

fluid.tests.nexus.constructComponent.componentOptions2 = {
    type: "fluid.modelComponent",
    model: {
        "some.model\\path": "two"
    }
};

// Note that these tests verify steps by peeking into the Nexus internal
// state. This is done by making the nexusComponentRoot addressable by
// giving it the grades "fluid.tests.nexus.componentRoot" and
// "fluid.resolveRoot" in the test Kettle app config.

fluid.tests.nexus.constructComponent.testDefs = [
    {
        name: "Construct and Destroy Components",
        gradeNames: "fluid.test.nexus.testCaseHolder",
        expect: 20,
        config: {
            configName: "fluid.tests.nexus.config",
            configPath: "%infusion-nexus/tests/configs"
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
                func: "fluid.test.nexus.assertNoComponentAtPath",
                args: [
                    "Component not yet constructed",
                    "{fluid.tests.nexus.componentRoot}",
                    "{tests}.options.testComponentPath"
                ]
            },
            {
                func: "fluid.test.nexus.assertNoComponentAtPath",
                args: [
                    "Component not yet constructed",
                    "{fluid.tests.nexus.componentRoot}",
                    "{tests}.options.testComponentPath2"
                ]
            },
            // Attempt to read component one
            {
                func: "{readComponentRequest1}.send",
                args: []
            },
            // Expect 404 resource not found
            {
                event: "{readComponentRequest1}.events.onComplete",
                listener: "fluid.test.nexus.assertStatusCode",
                args: ["{readComponentRequest1}", 404]
            },
            // Construct component one
            {
                func: "{constructComponentRequest1}.send",
                args: [fluid.tests.nexus.constructComponent.componentOptions1]
            },
            {
                event: "{constructComponentRequest1}.events.onComplete",
                listener: "fluid.test.nexus.assertStatusCode",
                args: ["{constructComponentRequest1}", 200]
            },
            {
                func: "fluid.test.nexus.assertComponentModel",
                args: [
                    "Model is as expected",
                    "{fluid.tests.nexus.componentRoot}",
                    "{tests}.options.testComponentPath",
                    fluid.tests.nexus.constructComponent.componentOptions1.model
                ]
            },
            // Attempt to read component one
            {
                func: "{readComponentRequest2}.send",
                args: []
            },
            // expect the response to contain model data, gradeNames, subcomponents
            {
                event: "{readComponentRequest2}.events.onComplete",
                listener: "fluid.test.nexus.assertLeftHand",
                args: [
                    "Component shell contains typeName and model data",
                    {
                        typeName: "fluid.modelComponent",
                        model: {
                            "some.model\\path": "one"
                        }
                    },
                    "{arguments}.0"
                ]
            },
            // Construct component two
            {
                func: "fluid.test.nexus.assertNotContainsComponent",
                args: [
                    "{fluid.tests.nexus.componentRoot}",
                    "{tests}.options.testComponentPath",
                    "{tests}.options.testComponentName2"
                ]
            },
            {
                func: "{constructComponentRequest2}.send",
                args: [fluid.tests.nexus.constructComponent.componentOptions2]
            },
            {
                event: "{constructComponentRequest2}.events.onComplete",
                listener: "fluid.test.nexus.assertStatusCode",
                args: ["{constructComponentRequest2}", 200]
            },
            {
                func: "fluid.test.nexus.assertComponentModel",
                args: [
                    "Model is as expected",
                    "{fluid.tests.nexus.componentRoot}",
                    "{tests}.options.testComponentPath2",
                    fluid.tests.nexus.constructComponent.componentOptions2.model
                ]
            },
            {
                func: "fluid.test.nexus.assertContainsComponent",
                args: [
                    "{fluid.tests.nexus.componentRoot}",
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
                listener: "fluid.test.nexus.assertStatusCode",
                args: ["{destroyComponentRequest2}", 200]
            },
            {
                func: "fluid.test.nexus.assertNoComponentAtPath",
                args: [
                    "Component has been destroyed",
                    "{fluid.tests.nexus.componentRoot}",
                    "{tests}.options.testComponentPath2"
                ]
            },
            {
                func: "fluid.test.nexus.assertNotContainsComponent",
                args: [
                    "{fluid.tests.nexus.componentRoot}",
                    "{tests}.options.testComponentPath",
                    "{tests}.options.testComponentName2"
                ]
            },
            // Destroy component one
            {
                func: "fluid.test.nexus.assertComponentModel",
                args: [
                    "Model is as expected",
                    "{fluid.tests.nexus.componentRoot}",
                    "{tests}.options.testComponentPath",
                    fluid.tests.nexus.constructComponent.componentOptions1.model
                ]
            },
            {
                func: "{destroyComponentRequest1}.send"
            },
            {
                event: "{destroyComponentRequest1}.events.onComplete",
                listener: "fluid.test.nexus.assertStatusCode",
                args: ["{destroyComponentRequest1}", 200]
            },
            // Attempt to read component one
            {
                func: "{readComponentRequest3}.send",
                args: []
            },
            // Expect 404 resource not found
            {
                event: "{readComponentRequest3}.events.onComplete",
                listener: "fluid.test.nexus.assertStatusCode",
                args: ["{readComponentRequest3}", 404]
            },
            {
                func: "fluid.test.nexus.assertNoComponentAtPath",
                args: [
                    "Component has been destroyed",
                    "{fluid.tests.nexus.componentRoot}",
                    "{tests}.options.testComponentPath"
                ]
            }
        ]
    }
];

kettle.test.bootstrapServer(fluid.tests.nexus.constructComponent.testDefs);
