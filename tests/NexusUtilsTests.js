/*
Copyright 2017 OCAD University

Licensed under the New BSD license. You may not use this file except in
compliance with this License.

You may obtain a copy of the License at
https://raw.githubusercontent.com/fluid-project/infusion-nexus/master/LICENSE.txt
*/

/* eslint-env node */

"use strict";

var fluid = require("infusion"),
    jqUnit = fluid.require("node-jqunit");

require("../index.js");

jqUnit.module("nexusUtils Tests");

fluid.defaults("fluid.tests.nexus.nexusUtils.parent", {
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
                                            afterDestroy: "{fluid.tests.nexus.nexusUtils.parent}.events.onComponentA1Destroyed"
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
                                afterDestroy: "{fluid.tests.nexus.nexusUtils.parent}.events.onComponentBDestroyed"
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

fluid.defaults("fluid.tests.nexus.nexusUtils.newComponent", {
    gradeNames: "fluid.component",
    newComponentName: null, // Will be provided by construction caller
    listeners: {
        onCreate: {
            funcName: "fluid.tests.nexus.nexusUtils.verifyNewComponent",
            args: [
                "{fluid.tests.nexus.nexusUtils.parent}.container",
                "{that}.options.newComponentName"
            ]
        }
    }
});

fluid.tests.nexus.nexusUtils.verifyNewComponent = function (container, newComponentName) {
    jqUnit.assertTrue("The new component exists in container",
        fluid.nexus.containsComponent(container, newComponentName));
    jqUnit.assertTrue("The new component has the expected grade",
        fluid.componentHasGrade(fluid.nexus.componentForPathInContainer(container, newComponentName),
            "fluid.tests.nexus.nexusUtils.newComponent"));
};

fluid.tests.nexus.testConstructInContainer = function (container, newComponentName) {
    jqUnit.assertFalse(newComponentName + " does not exist",
        fluid.nexus.containsComponent(container, newComponentName));

    fluid.nexus.constructInContainer(container, newComponentName, {
        type: "fluid.tests.nexus.nexusUtils.newComponent",
        newComponentName: newComponentName
    });
};

jqUnit.test("absComponentPath", function () {
    jqUnit.expect(1);

    var parent = fluid.construct("nexusUtilsTestParent", {
        type: "fluid.tests.nexus.nexusUtils.parent"
    });

    jqUnit.assertDeepEq("absComponentPath",
        ["nexusUtilsTestParent", "container", "componentA"],
        fluid.nexus.absComponentPath(parent.container, "componentA"));
});

jqUnit.test("componentForPathInContainer", function () {
    jqUnit.expect(4);

    var parent = fluid.tests.nexus.nexusUtils.parent();

    jqUnit.assertEquals("Top level component, path as string", parent.container.componentA,
        fluid.nexus.componentForPathInContainer(parent.container, "componentA"));

    jqUnit.assertEquals("Top level component, path as array", parent.container.componentA,
        fluid.nexus.componentForPathInContainer(parent.container, ["componentA"]));

    jqUnit.assertEquals("Second level component, path as string", parent.container.componentA.componentA1,
        fluid.nexus.componentForPathInContainer(parent.container, "componentA.componentA1"));

    jqUnit.assertEquals("Second level component, path as array", parent.container.componentA.componentA1,
        fluid.nexus.componentForPathInContainer(parent.container, ["componentA", "componentA1"]));
});

jqUnit.test("containsComponent", function () {
    jqUnit.expect(7);

    var parent = fluid.tests.nexus.nexusUtils.parent();

    jqUnit.assertTrue("Contains top level component, path as string",
        fluid.nexus.containsComponent(parent.container, "componentA"));

    jqUnit.assertTrue("Contains top level component, path as array",
        fluid.nexus.containsComponent(parent.container, ["componentA"]));

    jqUnit.assertTrue("Contains second level component, path as string",
        fluid.nexus.containsComponent(parent.container, "componentA.componentA1"));

    jqUnit.assertTrue("Contains second level component, path as array",
        fluid.nexus.containsComponent(parent.container, ["componentA", "componentA1"]));

    jqUnit.assertFalse("Does not contain top level component",
        fluid.nexus.containsComponent(parent.container, "nonExistingComponent"));

    jqUnit.assertFalse("Does not contain top level component, with subcomponent",
        fluid.nexus.containsComponent(parent.container, "nonExistingComponent.subcomponent"));

    jqUnit.assertFalse("Does not contain second level component",
        fluid.nexus.containsComponent(parent.container, "componentA.nonExistingComponent"));
});

jqUnit.test("constructInContainer top level component", function () {
    jqUnit.expect(3);

    var parent = fluid.tests.nexus.nexusUtils.parent();

    fluid.tests.nexus.testConstructInContainer(parent.container, "newComponent");
});

jqUnit.test("constructInContainer second level component", function () {
    jqUnit.expect(3);

    var parent = fluid.tests.nexus.nexusUtils.parent();

    fluid.tests.nexus.testConstructInContainer(parent.container, "componentA.newComponent");
});

jqUnit.test("destroyInContainer top level component", function () {
    jqUnit.expect(2);

    var parent = fluid.tests.nexus.nexusUtils.parent({
        listeners: {
            onComponentBDestroyed: {
                funcName: "jqUnit.assert",
                args: ["Component B gets destroyed"]
            }
        }
    });

    jqUnit.assertTrue("componentB exists initially", fluid.nexus.containsComponent(parent.container, "componentB"));
    fluid.nexus.destroyInContainer(parent.container, "componentB");
});

jqUnit.test("destroyInContainer second level component", function () {
    jqUnit.expect(2);

    var parent = fluid.tests.nexus.nexusUtils.parent({
        listeners: {
            onComponentA1Destroyed: {
                funcName: "jqUnit.assert",
                args: ["Component A1 gets destroyed"]
            }
        }
    });

    jqUnit.assertTrue("componentA1 exists initially", fluid.nexus.containsComponent(parent.container, "componentA.componentA1"));
    fluid.nexus.destroyInContainer(parent.container, "componentA.componentA1");
});
