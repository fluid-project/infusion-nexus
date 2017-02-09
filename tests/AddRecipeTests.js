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

gpii.tests.nexus.addRecipe.testDefs = [
    {
        name: "Add Recipe, construct reactants, and verify product created",
        gradeNames: "gpii.test.nexus.testCaseHolder",
        expect: 1,
        config: {
            configName: "gpii.tests.nexus.config",
            configPath: "%gpii-nexus/tests/configs"
        },
        testRecipeName: "recipeA",
        sequence: [
            {
                func: "{addRecipeRequest}.send",
                args: [gpii.tests.nexus.addRecipe.recipeA]
            },
            {
                event: "{addRecipeRequest}.events.onComplete",
                listener: "gpii.test.nexus.assertStatusCode",
                args: ["{addRecipeRequest}", 200]
            }

            // TODO: Construct reactants and verify product created
        ]
    }
];

kettle.test.bootstrapServer(gpii.tests.nexus.addRecipe.testDefs);
