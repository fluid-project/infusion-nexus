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
    kettle = require("kettle"),
    gpii = fluid.registerNamespace("gpii");

require("../index.js");
require("../src/test/NexusTestUtils.js");

kettle.loadTestingSupport();

fluid.registerNamespace("gpii.tests.nexus.addRecipe");

// Recipe

gpii.tests.nexus.addRecipe.recipeA = {
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
};

// Tests

gpii.tests.nexus.addRecipe.testDefs = [
    {
        name: "Add Recipe, construct reactants, and verify product created",
        gradeNames: "gpii.test.nexus.testCaseHolder",
        mergePolicy: {
            "testGradeOptions": "noexpand"
        },
        expect: 7,
        config: {
            configName: "gpii.tests.nexus.config",
            configPath: "%gpii-nexus/tests/configs"
        },
        testRecipeName: "recipeA",
        testGradeOptions: {
            reactantAOptions: {
                gradeNames: ["fluid.modelComponent"],
                model: {
                    valueA: 10
                }
            },
            reactantBOptions: {
                gradeNames: ["fluid.modelComponent"],
                model: {
                    valueB: 20
                }
            },
            recipeAProductOptions: {
                gradeNames: ["gpii.nexus.recipeProduct"],
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
            }
        },
        components: {
            writeReactantADefaultsRequest: {
                type: "kettle.test.request.http",
                options: {
                    path: "/defaults/gpii.tests.nexus.reactantA",
                    port: "{configuration}.options.serverPort",
                    method: "PUT"
                }
            },
            writeReactantBDefaultsRequest: {
                type: "kettle.test.request.http",
                options: {
                    path: "/defaults/gpii.tests.nexus.reactantB",
                    port: "{configuration}.options.serverPort",
                    method: "PUT"
                }
            },
            writeRecipeAProductDefaultsRequest: {
                type: "kettle.test.request.http",
                options: {
                    path: "/defaults/gpii.tests.nexus.recipeA.product",
                    port: "{configuration}.options.serverPort",
                    method: "PUT"
                }
            },
            constructReactantARequest: {
                type: "kettle.test.request.http",
                options: {
                    path: "/components/reactantA",
                    port: "{configuration}.options.serverPort",
                    method: "POST"
                }
            },
            constructReactantBRequest: {
                type: "kettle.test.request.http",
                options: {
                    path: "/components/reactantB",
                    port: "{configuration}.options.serverPort",
                    method: "POST"
                }
            }
        },
        sequence: [
            // Add our recipe
            {
                func: "{addRecipeRequest}.send",
                args: [gpii.tests.nexus.addRecipe.recipeA]
            },
            {
                event: "{addRecipeRequest}.events.onComplete",
                listener: "gpii.test.nexus.assertStatusCode",
                args: ["{addRecipeRequest}", 200]
            },
            // Write defaults for the reactants and product
            {
                func: "{writeReactantADefaultsRequest}.send",
                args: ["{that}.options.testGradeOptions.reactantAOptions"]
            },
            {
                event: "{writeReactantADefaultsRequest}.events.onComplete",
                listener: "gpii.test.nexus.assertStatusCode",
                args: ["{writeReactantADefaultsRequest}", 200]
            },
            {
                func: "{writeReactantBDefaultsRequest}.send",
                args: ["{that}.options.testGradeOptions.reactantBOptions"]
            },
            {
                event: "{writeReactantBDefaultsRequest}.events.onComplete",
                listener: "gpii.test.nexus.assertStatusCode",
                args: ["{writeReactantBDefaultsRequest}", 200]
            },
            {
                func: "{writeRecipeAProductDefaultsRequest}.send",
                args: ["{that}.options.testGradeOptions.recipeAProductOptions"]
            },
            {
                event: "{writeRecipeAProductDefaultsRequest}.events.onComplete",
                listener: "gpii.test.nexus.assertStatusCode",
                args: ["{writeRecipeAProductDefaultsRequest}", 200]
            },
            // Construct the reactants and verify that the product is
            // created
            {
                func: "{constructReactantARequest}.send",
                args: [{ type: "gpii.tests.nexus.reactantA" }]
            },
            {
                event: "{constructReactantARequest}.events.onComplete",
                listener: "gpii.test.nexus.assertStatusCode",
                args: ["{constructReactantARequest}", 200]
            },
            {
                func: "{constructReactantBRequest}.send",
                args: [{ type: "gpii.tests.nexus.reactantB" }]
            },
            {
                event: "{coOccurrenceEngine}.events.onProductCreated",
                listener: "jqUnit.assertValue",
                args: [
                    "Recipe A product created",
                    "{nexusComponentRoot}.recipeAProduct"
                ]
            },
            {
                event: "{constructReactantBRequest}.events.onComplete",
                listener: "gpii.test.nexus.assertStatusCode",
                args: ["{constructReactantBRequest}", 200]
            }


            // Change reactant A's model and verify that the product
            // relay rules cause reactant B's model to be updated

            // TODO
        ]
    }
];

kettle.test.bootstrapServer(gpii.tests.nexus.addRecipe.testDefs);
