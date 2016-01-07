"use strict";

var fluid = require("infusion"),
    gpii = fluid.registerNamespace("gpii"),
    kettle = fluid.registerNamespace("kettle"),
    jqUnit = fluid.require("node-jqunit"),
    path = require("path"),
    configPath = path.resolve(__dirname, "../configs");

require("kettle");
require("../src/Nexus.js");
require("../src/test/NexusTestUtils.js");

kettle.loadTestingSupport();

fluid.registerNamespace("gpii.tests.nexus.constructComponent");

gpii.tests.nexus.verifyComponentNotConstructed = function (path) {
    var component = gpii.nexus.componentForPath(path);
    jqUnit.assertNoValue("Component has not been constructed", component);
};

gpii.tests.nexus.verifyComponentConstructed = function (path, expectedModel) {
    var component = gpii.nexus.componentForPath(path);
    jqUnit.assertValue("Component has been constructed", component);
    jqUnit.assertDeepEq("Component model is as expected", expectedModel, component.model);
};

gpii.tests.nexus.constructComponent.componentOptions = {
    type: "fluid.modelComponent",
    model: {
        someModelPath: 2
    }
};

gpii.tests.nexus.constructComponent.testDefs = [
    {
        name: "Construct Component",
        gradeNames: "gpii.test.nexus.testCaseHolder",
        expect: 4,
        config: {
            configName: "gpii.nexus.config",
            configPath: configPath
        },
        testComponentPath: "nexusConstructedComponent",
        sequence: [
            {
                func: "gpii.tests.nexus.verifyComponentNotConstructed",
                args: ["{tests}.options.testComponentPath"]
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
                func: "gpii.tests.nexus.verifyComponentConstructed",
                args: [
                    "{tests}.options.testComponentPath",
                    gpii.tests.nexus.constructComponent.componentOptions.model
                ]
            }
        ]
    }
];

kettle.test.bootstrapServer(gpii.tests.nexus.constructComponent.testDefs);
