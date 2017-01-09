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

fluid.defaults("gpii.nexus.recipeMatcher", {
    gradeNames: "fluid.component",
    invokers: {
        matchRecipe: {
            funcName: "gpii.nexus.recipeMatcher.matchRecipe",
            args: [
                "{arguments}.0", // recipe to test
                "{arguments}.1"  // array of components
            ]
        }
    }
});

gpii.nexus.recipeMatcher.matchRecipe = function (recipe, components) {
    var matchedReactants = {};
    var foundAllReactants = true;
    fluid.each(recipe.reactants, function (reactant, reactantName) {
        var foundReactant = fluid.find(components, function (component) {
            if (gpii.nexus.recipeMatcher.componentMatchesReactantSpec(component, reactant.match)) {
                matchedReactants[reactantName] = component;
                return true;
            }
        });
        if (!foundReactant) {
            foundAllReactants = false;
        }
    });
    if (foundAllReactants) {
        return matchedReactants;
    } else {
        return false;
    }
};

// TODO: Copy the source for fluid.matchIoCSelector() and extend with
// other predicate types. To start, use the parsed version of the IoCSS
// expressions directly in the recipes (rather than implementing parsing
// logic for CSS-like syntax). In the future we could adopt a CSS-like
// syntax for the new predicate types.
//
// fluid.matchIoCSelector():
//
// https://github.com/fluid-project/infusion/blob/master/src/framework/core/js/FluidIoC.js#L322

gpii.nexus.recipeMatcher.componentMatchesReactantSpec = function (component, matchRules) {
    if (matchRules.type === "gradeMatcher") {
        return fluid.componentHasGrade(component, matchRules.gradeName);
    }
};

// TODO: Monitor appearance and disappearance of components using the
// instantiator "onComponentAttach" and "onComponentClear" events.
// See:
// https://github.com/amb26/fluid-authoring/blob/FLUID-4884/src/js/ComponentGraph.js#L270

// TODO: Where are recipe products constructed?
//       - Under the component root that the Co-Occurrence Engine is
//         configured with
//       - Subcomponents of the Co-Occurrence Engine
// TODO: Who names recipe products?
//       - Configured in each recipe
//       - Randomly assigned by the Co-Occurrence Engine
// TODO: Some mechanism to know if we already have a product made for
//       a given recipe

fluid.defaults("gpii.nexus.coOccurrenceEngine", {
    gradeNames: "fluid.modelComponent",
    components: {
        recipeMatcher: {
            type: "gpii.nexus.recipeMatcher"
        }
    },
    model: {
        componentRootPath: "",
        recipes: {}
    },
    invokers: {
        matchRecipes: {
            funcName: "gpii.nexus.coOccurrenceEngine.matchRecipes",
            args: [
                "{that}.recipeMatcher",
                "{that}.model.componentRootPath",
                "{that}.model.recipes"
            ]
        }
    }
});

gpii.nexus.coOccurrenceEngine.matchRecipes = function (recipeMatcher, componentRootPath, recipes) {
    var componentRoot = fluid.componentForPath(componentRootPath);

    var components = [];

    fluid.each(componentRoot, function (component) {
        if (fluid.isComponent(component)) {
            components.push(component);
        }
    });

    var matchedRecipes = [];

    fluid.each(recipes, function (recipe, recipeName) {
        var matchedReactants = recipeMatcher.matchRecipe(recipe, components);
        if (matchedReactants) {
            matchedRecipes.push({
                recipe: recipeName,
                reactants: matchedReactants
            });
        }
    });

    return matchedRecipes;
};
