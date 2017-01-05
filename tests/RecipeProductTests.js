/*
Copyright 2016 OCAD University

Licensed under the New BSD license. You may not use this file except in
compliance with this License.

You may obtain a copy of the License at
https://raw.githubusercontent.com/GPII/nexus/master/LICENSE.txt
*/

/* eslint-env node */

"use strict";

var fluid = require("infusion"),
    gpii = fluid.registerNamespace("gpii");

fluid.require("node-jqunit");

require("../index.js");

// Peer grades

fluid.defaults("gpii.tests.nexus.recipeProduct.gradeA", {
    gradeNames: "fluid.modelComponent",
    model: {
        valueA: 10
    }
});

fluid.defaults("gpii.tests.nexus.recipeProduct.gradeB", {
    gradeNames: "fluid.modelComponent",
    model: {
        valueB: 20
    }
});

// Recipe grade

fluid.defaults("gpii.tests.nexus.recipeA.product", {
    gradeNames: "gpii.nexus.recipeProduct",
    componentPaths: {
        componentA: null,
        componentB: null
    },
    components: {
        componentA: "@expand:fluid.componentForPath({recipeProduct}.options.componentPaths.componentA)",
        componentB: "@expand:fluid.componentForPath({recipeProduct}.options.componentPaths.componentB)"
    },
    modelRelay: [
        {
            source: "{componentA}.model.valueA",
            target: "{componentB}.model.valueB",
            forward: {
                excludeSource: "init"
            },
            singleTransform: {
                type: "fluid.transforms.identity"
            }
        }
    ]
});

// Tests

gpii.tests.nexus.recipeProduct.changeEventForComponent = function (path) {
    return fluid.componentForPath(path).applier.modelChanged;
};

gpii.tests.nexus.recipeProduct.changeModel = function (componentPath, modelPath, value) {
    fluid.componentForPath(componentPath).applier.change(modelPath, value);
};

fluid.defaults("gpii.tests.nexus.recipeProductTestTree", {
    gradeNames: ["fluid.test.testEnvironment"],
    components: {
        recipeProductTester: {
            type: "gpii.tests.nexus.recipeProductTester"
        }
    }
});

fluid.defaults("gpii.tests.nexus.recipeProductTester", {
    gradeNames: ["fluid.test.testCaseHolder"],
    modules: [ {
        name: "Nexus Recipe Product tests",
        tests: [
            {
                name: "Construct multiple recipes and verify model relay",
                expect: 2,
                sequence: [
                    // Add some peers
                    {
                        func: "fluid.construct",
                        args: [
                            "nexusRecipeProductTests",
                            {
                                type: "fluid.modelComponent"
                            }
                        ]
                    },
                    {
                        func: "fluid.construct",
                        args: [
                            "nexusRecipeProductTests.componentA1",
                            {
                                type: "gpii.tests.nexus.recipeProduct.gradeA"
                            }
                        ]
                    },
                    {
                        func: "fluid.construct",
                        args: [
                            "nexusRecipeProductTests.componentA2",
                            {
                                type: "gpii.tests.nexus.recipeProduct.gradeA"
                            }
                        ]
                    },
                    {
                        func: "fluid.construct",
                        args: [
                            "nexusRecipeProductTests.componentB1",
                            {
                                type: "gpii.tests.nexus.recipeProduct.gradeB"
                            }
                        ]
                    },
                    {
                        func: "fluid.construct",
                        args: [
                            "nexusRecipeProductTests.componentB2",
                            {
                                type: "gpii.tests.nexus.recipeProduct.gradeB"
                            }
                        ]
                    },
                    // Make some recipe products
                    {
                        func: "fluid.construct",
                        args: [
                            "nexusRecipeProductTests.recipeA1",
                            {
                                type: "gpii.tests.nexus.recipeA.product",
                                componentPaths: {
                                    componentA: "nexusRecipeProductTests.componentA1",
                                    componentB: "nexusRecipeProductTests.componentB1"
                                }
                            }
                        ]
                    }, {
                        func: "fluid.construct",
                        args: [
                            "nexusRecipeProductTests.recipeA2",
                            {
                                type: "gpii.tests.nexus.recipeA.product",
                                componentPaths: {
                                    componentA: "nexusRecipeProductTests.componentA2",
                                    componentB: "nexusRecipeProductTests.componentB2"
                                }
                            }
                        ]
                    },
                    // Exercise the model relay rules and verify
                    {
                        func: "gpii.tests.nexus.recipeProduct.changeModel",
                        args: ["nexusRecipeProductTests.componentA1", "valueA", 100]
                    },
                    {
                        changeEvent: "@expand:gpii.tests.nexus.recipeProduct.changeEventForComponent(nexusRecipeProductTests.componentB1)",
                        path: "valueB",
                        listener: "jqUnit.assertEquals",
                        args: [
                            "Component B1 model updated",
                            100,
                            "{arguments}.0"
                        ]
                    },
                    {
                        func: "gpii.tests.nexus.recipeProduct.changeModel",
                        args: ["nexusRecipeProductTests.componentA2", "valueA", 200]
                    },
                    {
                        changeEvent: "@expand:gpii.tests.nexus.recipeProduct.changeEventForComponent(nexusRecipeProductTests.componentB2)",
                        path: "valueB",
                        listener: "jqUnit.assertEquals",
                        args: [
                            "Component B2 model updated",
                            200,
                            "{arguments}.0"
                        ]
                    }
                ]
            }
        ]
    } ]
});

fluid.test.runTests([ "gpii.tests.nexus.recipeProductTestTree" ]);
