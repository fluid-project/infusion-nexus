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

fluid.defaults("gpii.tests.nexus.reactantA", {
    gradeNames: "fluid.modelComponent"
});

jqUnit.test("CoOccurrenceEngine Test", function () {
    jqUnit.expect(4);

    fluid.construct("nexusCoOccurrenceEngineTests", {
        type: "fluid.modelComponent"
    });

    var engine = gpii.nexus.coOccurrenceEngine({
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

    // Start with no components and verify that no recipes match
    jqUnit.assertEquals("No match", 0, engine.matchRecipes().length);

    // Make an instance of reactantA
    fluid.construct("nexusCoOccurrenceEngineTests.componentA1", {
        type: "gpii.tests.nexus.reactantA"
    });

    // Verify that recipeA now matches
    var matches = engine.matchRecipes();
    jqUnit.assertEquals("Matched one recipe", 1, matches.length);
    jqUnit.assertEquals("Matched recipeA", "recipeA", matches[0].recipe);
    jqUnit.assertEquals("Matched componentA",
        fluid.componentForPath("nexusCoOccurrenceEngineTests.componentA1"),
        matches[0].reactants.componentA);
});
