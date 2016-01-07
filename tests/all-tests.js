"use strict";

var fluid = require("infusion");

var tests = [
    "./ReadDefaultsTests.js",
    "./WriteDefaultsTests.js",
    "./ConstructComponentTests.js"
];

fluid.each(tests, function (path) {
    require(path);
});
