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

jqUnit.test("RecipeMatcher Test", function () {
    jqUnit.expect(2);

    var matcher = gpii.nexus.recipeMatcher();

    var recipe = {
        options: {
            reactants: {
                componentA: {
                    match: {
                        type: "gradeMatcher",
                        gradeName: "gpii.tests.nexus.reactantA"
                    }
                }
            }
        }
    };

    // Recipe does not match against empty component array
    jqUnit.assertFalse("No match", matcher.matchRecipe(recipe, []));

    // Recipe matches against an instance of reactantA
    var components = [
        gpii.tests.nexus.reactantA()
    ];
    jqUnit.assertEquals("Matches recipe", components[0], matcher.matchRecipe(recipe, components).componentA);
});
