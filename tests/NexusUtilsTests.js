/*
Copyright 2017 OCAD University

Licensed under the New BSD license. You may not use this file except in
compliance with this License.

You may obtain a copy of the License at
https://raw.githubusercontent.com/GPII/nexus/master/LICENSE.txt
*/

/* eslint-env node */

"use strict";

var fluid = require("infusion"),
    gpii = fluid.registerNamespace("gpii"),
    jqUnit = fluid.require("node-jqunit");

require("../index.js");

jqUnit.module("NexusUtils Tests");

fluid.defaults("gpii.tests.nexus.nexusUtils.parent", {
    gradeNames: ["fluid.component", "fluid.resolveRoot"],
    components: {
        container: {
            type: "fluid.component",
            options: {
                components: {
                    componentA: {
                        type: "fluid.component",
                        options: {
                            components: {
                                componentA1: {
                                    type: "fluid.component",
                                    options: {
                                        listeners: {
                                            afterDestroy: "{gpii.tests.nexus.nexusUtils.parent}.events.onComponentA1Destroyed"
                                        }
                                    }
                                }
                            }
                        }
                    },
                    componentB: {
                        type: "fluid.component",
                        options: {
                            listeners: {
                                afterDestroy: "{gpii.tests.nexus.nexusUtils.parent}.events.onComponentBDestroyed"
                            }
                        }
                    }
                }
            }
        }
    },
    events: {
        onComponentA1Destroyed: null,
        onComponentBDestroyed: null
    }
});

fluid.defaults("gpii.tests.nexus.nexusUtils.newComponent", {
    gradeNames: "fluid.component",
    newComponentName: null, // Will be provided by construction caller
    listeners: {
        onCreate: {
            funcName: "gpii.tests.nexus.nexusUtils.verifyNewComponent",
            args: [
                "{gpii.tests.nexus.nexusUtils.parent}.container",
                "{that}.options.newComponentName"
            ]
        }
    }
});

gpii.tests.nexus.nexusUtils.verifyNewComponent = function (container, newComponentName) {
    jqUnit.assertTrue("The new component exists in container",
        gpii.nexus.containsComponent(container, newComponentName));
    jqUnit.assertTrue("The new component has the expected grade",
        fluid.componentHasGrade(gpii.nexus.componentForPathInContainer(container, newComponentName),
            "gpii.tests.nexus.nexusUtils.newComponent"));
    jqUnit.start();
};

gpii.tests.nexus.testConstructInContainer = function (container, newComponentName) {
    jqUnit.assertFalse(newComponentName + " does not exist",
        gpii.nexus.containsComponent(container, newComponentName));

    gpii.nexus.constructInContainer(container, newComponentName, {
        type: "gpii.tests.nexus.nexusUtils.newComponent",
        newComponentName: newComponentName
    });
};

jqUnit.test("absComponentPath", function () {
    jqUnit.expect(1);

    var parent = fluid.construct("nexusUtilsTestParent", {
        type: "gpii.tests.nexus.nexusUtils.parent"
    });

    jqUnit.assertDeepEq("absComponentPath",
        ["nexusUtilsTestParent", "container", "componentA"],
        gpii.nexus.absComponentPath(parent.container, "componentA"));
});

jqUnit.test("componentForPathInContainer", function () {
    jqUnit.expect(4);

    var parent = gpii.tests.nexus.nexusUtils.parent();

    jqUnit.assertEquals("Top level component, path as string", parent.container.componentA,
        gpii.nexus.componentForPathInContainer(parent.container, "componentA"));

    jqUnit.assertEquals("Top level component, path as array", parent.container.componentA,
        gpii.nexus.componentForPathInContainer(parent.container, ["componentA"]));

    jqUnit.assertEquals("Second level component, path as string", parent.container.componentA.componentA1,
        gpii.nexus.componentForPathInContainer(parent.container, "componentA.componentA1"));

    jqUnit.assertEquals("Second level component, path as array", parent.container.componentA.componentA1,
        gpii.nexus.componentForPathInContainer(parent.container, ["componentA", "componentA1"]));
});

jqUnit.test("containsComponent", function () {
    jqUnit.expect(7);

    var parent = gpii.tests.nexus.nexusUtils.parent();

    jqUnit.assertTrue("Contains top level component, path as string",
        gpii.nexus.containsComponent(parent.container, "componentA"));

    jqUnit.assertTrue("Contains top level component, path as array",
        gpii.nexus.containsComponent(parent.container, ["componentA"]));

    jqUnit.assertTrue("Contains second level component, path as string",
        gpii.nexus.containsComponent(parent.container, "componentA.componentA1"));

    jqUnit.assertTrue("Contains second level component, path as array",
        gpii.nexus.containsComponent(parent.container, ["componentA", "componentA1"]));

    jqUnit.assertFalse("Does not contain top level component",
        gpii.nexus.containsComponent(parent.container, "nonExistingComponent"));

    jqUnit.assertFalse("Does not contain top level component, with subcomponent",
        gpii.nexus.containsComponent(parent.container, "nonExistingComponent.subcomponent"));

    jqUnit.assertFalse("Does not contain second level component",
        gpii.nexus.containsComponent(parent.container, "componentA.nonExistingComponent"));
});

jqUnit.asyncTest("constructInContainer top level component", function () {
    jqUnit.expect(3);

    var parent = gpii.tests.nexus.nexusUtils.parent();

    gpii.tests.nexus.testConstructInContainer(parent.container, "newComponent");
});

jqUnit.asyncTest("constructInContainer second level component", function () {
    jqUnit.expect(3);

    var parent = gpii.tests.nexus.nexusUtils.parent();

    gpii.tests.nexus.testConstructInContainer(parent.container, "componentA.newComponent");
});

jqUnit.asyncTest("destroyInContainer top level component", function () {
    jqUnit.expect(1);

    var parent = gpii.tests.nexus.nexusUtils.parent({
        listeners: {
            onComponentBDestroyed: "jqUnit.start"
        }
    });

    jqUnit.assertTrue("componentB exists initially", gpii.nexus.containsComponent(parent.container, "componentB"));
    gpii.nexus.destroyInContainer(parent.container, "componentB");
});

jqUnit.asyncTest("destroyInContainer second level component", function () {
    jqUnit.expect(1);

    var parent = gpii.tests.nexus.nexusUtils.parent({
        listeners: {
            onComponentA1Destroyed: "jqUnit.start"
        }
    });

    jqUnit.assertTrue("componentA1 exists initially", gpii.nexus.containsComponent(parent.container, "componentA.componentA1"));
    gpii.nexus.destroyInContainer(parent.container, "componentA.componentA1");
});
