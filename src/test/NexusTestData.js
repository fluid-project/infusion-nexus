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
    gpii = fluid.registerNamespace("gpii");

gpii.test.nexus.reactantAOptions = {
    gradeNames: ["fluid.modelComponent"],
    model: {
        valueA: 10
    }
};

fluid.defaults("gpii.test.nexus.reactantA", gpii.test.nexus.reactantAOptions);

gpii.test.nexus.reactantBOptions = {
    gradeNames: ["fluid.modelComponent"],
    model: {
        valueB: 20
    }
};

fluid.defaults("gpii.test.nexus.reactantB", gpii.test.nexus.reactantBOptions);

gpii.test.nexus.recipeAProductOptions = {
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
};

fluid.defaults("gpii.test.nexus.recipeA.product", gpii.test.nexus.recipeAProductOptions);
