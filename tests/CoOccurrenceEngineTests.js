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
require("../src/test/NexusTestData.js");

// Co-Occurrence Engine

fluid.defaults("gpii.tests.nexus.coOccurrenceEngine", {
    gradeNames: ["gpii.nexus.coOccurrenceEngine"],
    model: {
        recipes: {
            recipeA: {
                reactants: {
                    componentA: {
                        match: {
                            type: "gradeMatcher",
                            gradeName: "gpii.test.nexus.reactantA"
                        }
                    },
                    componentB: {
                        match: {
                            type: "gradeMatcher",
                            gradeName: "gpii.test.nexus.reactantB"
                        }
                    }
                },
                product: {
                    path: "recipeAProduct",
                    options: {
                        type: "gpii.test.nexus.recipeA.product"
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
        nexusComponentRoot: {
            type: "gpii.nexus.nexusComponentRoot"
        },
        coOccurrenceEngine : {
            type: "gpii.tests.nexus.coOccurrenceEngine",
            options: {
                components: {
                    nexusComponentRoot: "{coOccurrenceEngineTests}.nexusComponentRoot"
                }
            }
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
                expect: 3,
                sequence: [
                    // Start with no reactants and verify that no recipe
                    // product exists
                    {
                        func: "jqUnit.assertNoValue",
                        args: [
                            "No product existing",
                            "{nexusComponentRoot}.recipeAProduct"
                        ]
                    },
                    // Add reactant A and reactant B and verify that the
                    // product for recipe A is created
                    {
                        func: "{nexusComponentRoot}.constructComponent",
                        args: [
                            "reactantA",
                            {
                                type: "gpii.test.nexus.reactantA"
                            }
                        ]
                    },
                    {
                        func: "{nexusComponentRoot}.constructComponent",
                        args: [
                            "reactantB",
                            {
                                type: "gpii.test.nexus.reactantB"
                            }
                        ]
                    },
                    {
                        event: "{coOccurrenceEngine}.events.onProductCreated",
                        listener: "jqUnit.assertValue",
                        args: [
                            "Recipe A product created",
                            "{nexusComponentRoot}.recipeAProduct"
                        ]
                    },
                    // Exercise the model relay rules and verify
                    {
                        func: "{nexusComponentRoot}.reactantA.applier.change",
                        args: [ "valueA", 42 ]
                    },
                    {
                        changeEvent: "{nexusComponentRoot}.reactantB.applier.modelChanged",
                        path: "valueB",
                        listener: "jqUnit.assertEquals",
                        args: [
                            "Reactant B model updated",
                            84,
                            "{arguments}.0"
                        ]
                    }
                ]
            }
        ]
    } ]
});

fluid.test.runTests([ "gpii.tests.nexus.coOccurrenceEngineTests" ]);
