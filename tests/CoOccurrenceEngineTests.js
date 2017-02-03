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
                    path: "recipeAProduct",
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
                                type: "gpii.tests.nexus.reactantA"
                            }
                        ]
                    },
                    {
                        func: "{nexusComponentRoot}.constructComponent",
                        args: [
                            "reactantB",
                            {
                                type: "gpii.tests.nexus.reactantB"
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
                        args: [ "valueA", 100 ]
                    },
                    {
                        changeEvent: "{nexusComponentRoot}.reactantB.applier.modelChanged",
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
