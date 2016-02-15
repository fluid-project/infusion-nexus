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

fluid.registerNamespace("gpii.tests.nexus.constructComponent");

gpii.tests.nexus.constructComponent.componentOptions = {
    type: "fluid.modelComponent",
    model: {
        someModelPath: 2
    }
};

gpii.tests.nexus.constructComponent.testDefs = [
    {
        name: "Construct and Destroy Component",
        gradeNames: "gpii.test.nexus.testCaseHolder",
        expect: 6,
        config: {
            configName: "gpii.tests.nexus.config",
            configPath: configPath
        },
        testComponentPath: "nexusConstructComponentTestComponent",
        sequence: [
            {
                func: "gpii.test.nexus.assertNoComponentAtPath",
                args: ["Component not yet constructed", "{tests}.options.testComponentPath"]
            },
            {
                func: "{constructComponentRequest}.send",
                args: [gpii.tests.nexus.constructComponent.componentOptions]
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
                    "{tests}.options.testComponentPath",
                    gpii.tests.nexus.constructComponent.componentOptions.model
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
                args: ["Component has been destroyed", "{tests}.options.testComponentPath"]
            }
        ]
    }
];

kettle.test.bootstrapServer(gpii.tests.nexus.constructComponent.testDefs);
