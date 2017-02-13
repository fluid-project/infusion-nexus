/*
Copyright 2016, 2017 OCAD University

Licensed under the New BSD license. You may not use this file except in
compliance with this License.

You may obtain a copy of the License at
https://raw.githubusercontent.com/GPII/nexus/master/LICENSE.txt
*/

/* eslint-env node */

"use strict";

var fluid = require("infusion");

fluid.require("node-jqunit");

require("../index.js");
require("../src/test/NexusTestUtils.js");
require("../src/test/NexusTestData.js");

// Tests

fluid.defaults("gpii.tests.nexus.recipeProductTestTree", {
    gradeNames: ["fluid.test.testEnvironment"],
    components: {
        recipeProductTester: {
            type: "gpii.tests.nexus.recipeProductTester"
        }
    }
});

fluid.defaults("gpii.tests.nexus.recipeProductTester", {
    gradeNames: ["fluid.test.testCaseHolder"],
    modules: [ {
        name: "Nexus Recipe Product tests",
        tests: [
            {
                name: "Construct multiple recipes and verify model relay",
                expect: 2,
                sequence: [
                    // Add some peers
                    {
                        func: "fluid.construct",
                        args: [
                            "nexusRecipeProductTests",
                            {
                                type: "fluid.modelComponent"
                            }
                        ]
                    },
                    {
                        func: "fluid.construct",
                        args: [
                            "nexusRecipeProductTests.componentA1",
                            {
                                type: "gpii.test.nexus.reactantA"
                            }
                        ]
                    },
                    {
                        func: "fluid.construct",
                        args: [
                            "nexusRecipeProductTests.componentA2",
                            {
                                type: "gpii.test.nexus.reactantA"
                            }
                        ]
                    },
                    {
                        func: "fluid.construct",
                        args: [
                            "nexusRecipeProductTests.componentB1",
                            {
                                type: "gpii.test.nexus.reactantB"
                            }
                        ]
                    },
                    {
                        func: "fluid.construct",
                        args: [
                            "nexusRecipeProductTests.componentB2",
                            {
                                type: "gpii.test.nexus.reactantB"
                            }
                        ]
                    },
                    // Make some recipe products
                    {
                        func: "fluid.construct",
                        args: [
                            "nexusRecipeProductTests.recipeA1",
                            {
                                type: "gpii.test.nexus.recipeA.product",
                                componentPaths: {
                                    componentA: "nexusRecipeProductTests.componentA1",
                                    componentB: "nexusRecipeProductTests.componentB1"
                                }
                            }
                        ]
                    }, {
                        func: "fluid.construct",
                        args: [
                            "nexusRecipeProductTests.recipeA2",
                            {
                                type: "gpii.test.nexus.recipeA.product",
                                componentPaths: {
                                    componentA: "nexusRecipeProductTests.componentA2",
                                    componentB: "nexusRecipeProductTests.componentB2"
                                }
                            }
                        ]
                    },
                    // Exercise the model relay rules and verify
                    {
                        func: "gpii.test.nexus.changeModelAtPath",
                        args: ["nexusRecipeProductTests.componentA1", "valueA", 100]
                    },
                    {
                        changeEvent: "@expand:gpii.test.nexus.changeEventForComponent(nexusRecipeProductTests.componentB1)",
                        path: "valueB",
                        listener: "jqUnit.assertEquals",
                        args: [
                            "Component B1 model updated",
                            100,
                            "{arguments}.0"
                        ]
                    },
                    {
                        func: "gpii.test.nexus.changeModelAtPath",
                        args: ["nexusRecipeProductTests.componentA2", "valueA", 200]
                    },
                    {
                        changeEvent: "@expand:gpii.test.nexus.changeEventForComponent(nexusRecipeProductTests.componentB2)",
                        path: "valueB",
                        listener: "jqUnit.assertEquals",
                        args: [
                            "Component B2 model updated",
                            200,
                            "{arguments}.0"
                        ]
                    }
                ]
            }
        ]
    } ]
});

fluid.test.runTests([ "gpii.tests.nexus.recipeProductTestTree" ]);
