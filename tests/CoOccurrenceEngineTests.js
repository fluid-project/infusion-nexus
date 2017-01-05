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

jqUnit.test("CoOccurrenceEngine Test", function () {
    jqUnit.expect(4);

    var componentRoot = fluid.construct("nexusCoOccurrenceEngineTests", {
        type: "fluid.modelComponent"
    });

    var engine = gpii.nexus.coOccurrenceEngine({
        recipes: [
            "@expand:gpii.tests.nexus.recipeA()"
        ]
    });

    // Start with no components and verify that no recipes match
    jqUnit.assertEquals("No match", 0, engine.matchRecipes(componentRoot).length);

    // Make an instance of reactantA
    fluid.construct("nexusCoOccurrenceEngineTests.componentA1", {
        type: "gpii.tests.nexus.reactantA"
    });

    // Verify that recipeA now matches
    var matches = engine.matchRecipes(componentRoot);
    jqUnit.assertEquals("Matched one recipe", 1, matches.length);
    jqUnit.assertTrue("Matched recipeA", fluid.componentHasGrade(matches[0].recipe,
        "gpii.tests.nexus.recipeA"));
    jqUnit.assertEquals("Matched componentA",
        fluid.componentForPath("nexusCoOccurrenceEngineTests.componentA1"),
        matches[0].reactants.componentA);
});
