/*
Copyright 2016, 2017 OCAD University

Licensed under the New BSD license. You may not use this file except in
compliance with this License.

You may obtain a copy of the License at
https://raw.githubusercontent.com/GPII/nexus/master/LICENSE.txt
*/

/* eslint-env node */

"use strict";

var fluid = require("infusion"),
    gpii = fluid.registerNamespace("gpii");

fluid.defaults("gpii.nexus.recipe", {
    gradeNames: "fluid.modelComponent"
});

fluid.defaults("gpii.nexus.recipeProduct", {
    gradeNames: "fluid.modelComponent"
});

fluid.defaults("gpii.nexus.coOccurrenceEngine", {
    gradeNames: "fluid.modelComponent",
    recipes: [],
    invokers: {
        matchRecipes: {
            funcName: "gpii.nexus.coOccurrenceEngine.matchRecipes",
            args: [
                "{that}.options.recipes",
                "{arguments}.0" // component root to match against
            ]
        }
    }
});

gpii.nexus.coOccurrenceEngine.matchRecipes = function (recipes, componentRoot) {
    var components = [];

    fluid.each(componentRoot, function (component) {
        if (fluid.isComponent(component)) {
            components.push(component);
        }
    });

    var matchedRecipes = [];

    fluid.each(recipes, function (recipe) {
        var recipeMatch = {
            recipe: recipe,
            reactants: { }
        };
        var foundAllReactants = true;
        fluid.each(recipe.options.reactants, function (reactant, name) {
            var foundReactant = fluid.find(components, function (component) {
                if (gpii.nexus.coOccurrenceEngine.componentMatchesReactantSpec(reactant.match, component)) {
                    recipeMatch.reactants[name] = component;
                    return true;
                }
            });
            if (!foundReactant) {
                foundAllReactants = false;
            }
        });
        if (foundAllReactants) {
            matchedRecipes.push(recipeMatch);
        }
    });

    return matchedRecipes;
};

gpii.nexus.coOccurrenceEngine.componentMatchesReactantSpec = function (matchRules, component) {
    if (matchRules.type === "gradeMatcher") {
        return fluid.componentHasGrade(component, matchRules.gradeName);
    }
};
