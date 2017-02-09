/*
Copyright 2015, 2016 OCAD University

Licensed under the New BSD license. You may not use this file except in
compliance with this License.

You may obtain a copy of the License at
https://raw.githubusercontent.com/GPII/nexus/master/LICENSE.txt
*/

/* eslint-env node */

"use strict";

var fluid = require("infusion");

var tests = [
    "./ReadDefaultsTests.js",
    "./WriteDefaultsTests.js",
    "./ConstructAndDestroyComponentTests.js",
    "./BindModelTests.js",
    "./RecipeProductTests.js",
    "./RecipeMatcherTests.js",
    "./CoOccurrenceEngineTests.js",
    "./AddRecipeTests.js"
];

fluid.each(tests, function (path) {
    require(path);
});
