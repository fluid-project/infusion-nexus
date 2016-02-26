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

fluid.registerNamespace("gpii.tests.nexus.bindModel");

gpii.tests.nexus.bindModel.componentOptions = {
    type: "fluid.modelComponent",
    model: {
        someModelPath: 2
    }
};

gpii.tests.nexus.bindModel.registerModelListenerForPath = function (componentPath, modelPath, event) {
    var component = gpii.nexus.componentForPath(componentPath);
    // TODO: Can I use an invoker here rather than an anonymous function?
    //       I was unable to determine the right name to reference the invoker
    component.applier.modelChanged.addListener(modelPath, function () { event.fire(); });
};

fluid.defaults("gpii.tests.nexus.bindModel.wsClient", {
    gradeNames: "kettle.test.request.ws",
    path: "/bindModel/%componentPath/%modelPath",
    port: "{configuration}.options.serverPort",
    termMap: {
        componentPath: "{tests}.options.testComponentPath",
        modelPath: "{tests}.options.testModelPath"
    }
});

// TODO: Test with multiple connected WebSocket clients
// TODO: Test with change message path other than ""

gpii.tests.nexus.bindModel.testDefs = [
    {
        name: "Bind Model",
        gradeNames: "gpii.test.nexus.testCaseHolder",
        expect: 6,
        config: {
            configName: "gpii.tests.nexus.config",
            configPath: configPath
        },
        testComponentPath: "nexusBindModelTestComponent",
        testModelPath: "someModelPath",
        components: {
            client: {
                type: "gpii.tests.nexus.bindModel.wsClient"
            }
        },
        events: {
            targetModelChanged: null
        },
        /*
        // TODO: See gpii.tests.nexus.bindModel.registerModelListenerForPath
        invokers: {
            fireTargetModelChanged: {
                "this": "{testCaseHolder}.events.targetModelChanged",
                method: "fire"
            }
        },
        */
        sequence: [
            {
                func: "gpii.test.nexus.assertNoComponentAtPath",
                args: ["Component not yet constructed", "{tests}.options.testComponentPath"]
            },
            {
                func: "{constructComponentRequest}.send",
                args: [gpii.tests.nexus.bindModel.componentOptions]
            },
            {
                event: "{constructComponentRequest}.events.onComplete",
                listener: "gpii.test.nexus.assertStatusCode",
                args: ["{constructComponentRequest}", 200]
            },
            {
                func: "gpii.tests.nexus.bindModel.registerModelListenerForPath",
                args: [
                    "{tests}.options.testComponentPath",
                    "{tests}.options.testModelPath",
                    "{testCaseHolder}.events.targetModelChanged"
                ]
            },
            {
                func: "{client}.connect"
            },
            {
                event: "{client}.events.onConnect",
                listener: "fluid.identity"
            },
            {
                event: "{client}.events.onReceiveMessage",
                listener: "jqUnit.assertEquals",
                args: ["Received initial message with the state of the component's model", 2, "{arguments}.0"]
            },
            {
                func: "{client}.send",
                args: [
                    {
                        path: "",
                        value: 10
                    }
                ]
            },
            // TODO: Can I rely on the targetModelChanged and onReceiveMessage events happening in this order?
            {
                event: "{testCaseHolder}.events.targetModelChanged",
                listener: "gpii.test.nexus.assertComponentModel",
                args: ["Model updated", "{tests}.options.testComponentPath", { someModelPath: 10 }]
            },
            {
                event: "{client}.events.onReceiveMessage",
                // TODO: Do I want a message here?
                //       Should a client receive change notifications for changes it made?
                //       Is it unavoidable?
                listener: "jqUnit.assertEquals",
                args: ["Received change message", 10, "{arguments}.0"]
            },
            {
                func: "{client}.disconnect"
            }
        ]
    }
];

kettle.test.bootstrapServer(gpii.tests.nexus.bindModel.testDefs);
