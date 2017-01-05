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

fluid.defaults("gpii.tests.nexus.recipeA", {
    gradeNames: "gpii.nexus.recipe",
    reactants: {
        componentA: {
            match: {
                type: "gradeMatcher",
                gradeName: "gpii.tests.nexus.reactantA"
            }
        }
    }
});

jqUnit.test("CoOccurenceEngine Test", function () {
    jqUnit.expect(2);

    var componentRoot = fluid.construct("nexusCoOccurenceEngineTests", {
        type: "fluid.modelComponent"
    });

    var engine = gpii.nexus.coOccurrenceEngine({
        model: {
            recipes: [
                // TODO: Better way to instantiate recipes?
                gpii.tests.nexus.recipeA()
            ]
        }
    });

    // Start with no components and verify that no recipes match
    jqUnit.assertEquals("No match", 0, engine.matchRecipes(componentRoot).length);

    // Make an instance of reactantA
    fluid.construct("nexusCoOccurenceEngineTests.componentA1", {
        type: "gpii.tests.nexus.reactantA"
    });

    // Verify that recipeA now matches
    var matches = engine.matchRecipes(componentRoot);
    jqUnit.assertTrue("Match recipeA", matches.length === 1 && fluid.contains(matches[0].options.gradeNames, "gpii.tests.nexus.recipeA"));
});
