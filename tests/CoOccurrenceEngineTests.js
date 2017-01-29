/*
Copyright 2017 OCAD University

Licensed under the New BSD license. You may not use this file except in
compliance with this License.

You may obtain a copy of the License at
https://raw.githubusercontent.com/GPII/nexus/master/LICENSE.txt
*/

/* eslint-env node */

"use strict";

var fluid = require("infusion");

fluid.require("node-jqunit");

require("../index.js");
require("../src/test/NexusTestUtils.js");

// Reactant grades

fluid.defaults("gpii.tests.nexus.reactantA", {
    gradeNames: "fluid.modelComponent",
    model: {
        valueA: 10
    }
});

fluid.defaults("gpii.tests.nexus.reactantB", {
    gradeNames: "fluid.modelComponent",
    model: {
        valueB: 20
    }
});

// Recipe product grade

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

// Co-Occurrence Engine

fluid.defaults("gpii.tests.nexus.coOccurrenceEngine", {
    gradeNames: ["gpii.nexus.coOccurrenceEngine"],
    model: {
        componentRootPath: "nexusCoOccurrenceEngineTests",
        recipes: {
            recipeA: {
                reactants: {
                    componentA: {
                        match: {
                            type: "gradeMatcher",
                            gradeName: "gpii.tests.nexus.reactantA"
                        }
                    },
                    componentB: {
                        match: {
                            type: "gradeMatcher",
                            gradeName: "gpii.tests.nexus.reactantB"
                        }
                    }
                },
                product: {
                    name: "recipeAProduct",
                    options: {
                        type: "gpii.tests.nexus.recipeA.product"
                    }
                }
            }
        }
    }
});

// Tests

fluid.defaults("gpii.tests.nexus.coOccurrenceEngineTests", {
    gradeNames: ["fluid.test.testEnvironment"],
    components: {
        coOccurrenceEngine : {
            type: "gpii.tests.nexus.coOccurrenceEngine"
        },
        coOccurrenceEngineTester: {
            type: "gpii.tests.nexus.coOccurrenceEngineTester"
        }
    }
});

fluid.defaults("gpii.tests.nexus.coOccurrenceEngineTester", {
    gradeNames: ["fluid.test.testCaseHolder"],
    modules: [ {
        name: "Nexus Co-Occurrence Engine tests",
        tests: [
            {
                name: "Construct reactants and verify product created",
                expect: 4,
                sequence: [
                    // Construct component root
                    {
                        func: "fluid.construct",
                        args: [
                            "nexusCoOccurrenceEngineTests",
                            {
                                type: "fluid.modelComponent"
                            }
                        ]
                    },
                    // Start with no reactants and verify that no recipe
                    // products are created
                    {
                        func: "{coOccurrenceEngine}.onPeersChanged"
                    },
                    {
                        event: "{coOccurrenceEngine}.events.afterProductsCreated",
                        listener: "gpii.test.nexus.assertNoComponentAtPath",
                        args: [
                            "No product constructed",
                            "nexusCoOccurrenceEngineTests.recipeAProduct"
                        ]
                    },
                    // Add reactant A and verify that no recipe products
                    // are created
                    {
                        func: "fluid.construct",
                        args: [
                            "nexusCoOccurrenceEngineTests.reactantA",
                            {
                                type: "gpii.tests.nexus.reactantA"
                            }
                        ]
                    },
                    {
                        func: "{coOccurrenceEngine}.onPeersChanged"
                    },
                    {
                        event: "{coOccurrenceEngine}.events.afterProductsCreated",
                        listener: "gpii.test.nexus.assertNoComponentAtPath",
                        args: [
                            "No product constructed",
                            "nexusCoOccurrenceEngineTests.recipeAProduct"
                        ]
                    },
                    // Add reactant B and verify that the product for
                    // recipe A is created
                    {
                        func: "fluid.construct",
                        args: [
                            "nexusCoOccurrenceEngineTests.reactantB",
                            {
                                type: "gpii.tests.nexus.reactantB"
                            }
                        ]
                    },
                    {
                        func: "{coOccurrenceEngine}.onPeersChanged"
                    },
                    {
                        event: "{coOccurrenceEngine}.events.afterProductsCreated",
                        listener: "gpii.test.nexus.assertComponentAtPath",
                        args: [
                            "Recipe A product constructed",
                            "nexusCoOccurrenceEngineTests.recipeAProduct"
                        ]
                    },
                    // Exercise the model relay rules and verify
                    {
                        func: "gpii.test.nexus.changeModelAtPath",
                        args: ["nexusCoOccurrenceEngineTests.reactantA", "valueA", 100]
                    },
                    {
                        changeEvent: "@expand:gpii.test.nexus.changeEventForComponent(nexusCoOccurrenceEngineTests.reactantB)",
                        path: "valueB",
                        listener: "jqUnit.assertEquals",
                        args: [
                            "Reactant B model updated",
                            100,
                            "{arguments}.0"
                        ]
                    }
                ]
            }
        ]
    } ]
});

fluid.test.runTests([ "gpii.tests.nexus.coOccurrenceEngineTests" ]);
