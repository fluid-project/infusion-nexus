/*
Copyright 2015, 2016, 2017 OCAD University

Licensed under the New BSD license. You may not use this file except in
compliance with this License.

You may obtain a copy of the License at
https://raw.githubusercontent.com/fluid-project/infusion-nexus/master/LICENSE.txt
*/

/* eslint-env node */

"use strict";

var fluid = require("infusion"),
    jqUnit = fluid.require("node-jqunit");

fluid.registerNamespace("fluid.test.nexus");

fluid.test.nexus.assertStatusCode = function (request, statusCode) {
    var response = request.nativeResponse;
    jqUnit.assertEquals("Response has status code " + statusCode, statusCode, response.statusCode);
};

fluid.test.nexus.verifyReadDefaultsResponse = function (body, request, expectedGradeSpec) {
    // TODO: Switch over to the new assertion function of KETTLE-39
    var responseGradeSpec = JSON.parse(body);
    var response = request.nativeResponse;
    jqUnit.assertEquals("Response has status code 200", 200, response.statusCode);
    jqUnit.assertTrue("Response has JSON content-type",
                      response.headers["content-type"].indexOf("application/json") === 0);
    jqUnit.assertLeftHand("Response has expected grade specification", expectedGradeSpec, responseGradeSpec);
};

fluid.test.nexus.assertNoComponentAtPath = function (message, componentRoot, path) {
    jqUnit.assertFalse(message, fluid.nexus.containsComponent(componentRoot, path));
};

fluid.test.nexus.assertComponentModel = function (message, componentRoot, path, expectedModel) {
    var component = fluid.nexus.componentForPathInContainer(componentRoot, path);
    jqUnit.assertValue("Component exists", component);
    jqUnit.assertDeepEq(message, expectedModel, component.model);
};

fluid.test.nexus.assertNotContainsComponent = function (componentRoot, parentPath, childName) {
    var parent = fluid.nexus.componentForPathInContainer(componentRoot, parentPath);
    jqUnit.assertNoValue(parentPath + " component does not contain " + childName, parent[childName]);
};

fluid.test.nexus.assertContainsComponent = function (componentRoot, parentPath, childName) {
    var parent = fluid.nexus.componentForPathInContainer(componentRoot, parentPath);
    jqUnit.assertValue(parentPath + " component contains " + childName, parent[childName]);
};

/**
 * Assert that the object toTest contains a set of keys with given values.
 * Can also be understood as "assert that the object expected is a subset of the object toTest".
 * @param {Object} expected the expected keys and values.
 * @param {Object} actual the object to test.
 */
fluid.test.nexus.assertKeyValues = function (expected, actual) {
    for (var key in expected) {
        var value = expected[key];
        jqUnit.assertDeepEq(value, actual[key]);
    }
};

fluid.defaults("fluid.test.nexus.readDefaultsRequest", {
    gradeNames: ["kettle.test.request.http"],
    path: "/defaults/%gradeName",
    port: "{configuration}.options.serverPort",
    method: "GET",
    termMap: {
        gradeName: "fill in construction options"
    }
});

fluid.defaults("fluid.test.nexus.writeDefaultsRequest", {
    gradeNames: ["kettle.test.request.http"],
    path: "/defaults/%gradeName",
    port: "{configuration}.options.serverPort",
    method: "PUT",
    termMap: {
        gradeName: "fill in construction options"
    }
});

fluid.defaults("fluid.test.nexus.readComponentRequest", {
    gradeNames: ["kettle.test.request.http"],
    path: "/components/%path",
    port: "{configuration}.options.serverPort",
    method: "GET",
    termMap: {
        path: "fill in construction options"
    }
});

fluid.defaults("fluid.test.nexus.constructComponentRequest", {
    gradeNames: ["kettle.test.request.http"],
    path: "/components/%path",
    port: "{configuration}.options.serverPort",
    method: "PUT",
    termMap: {
        path: "fill in construction options"
    }
});

fluid.defaults("fluid.test.nexus.destroyComponentRequest", {
    gradeNames: ["kettle.test.request.http"],
    path: "/components/%path",
    port: "{configuration}.options.serverPort",
    method: "DELETE",
    termMap: {
        path: "fill in construction options"
    }
});

fluid.defaults("fluid.test.nexus.testCaseHolder", {
    gradeNames: "kettle.test.testCaseHolder",
    components: {
        readDefaultsRequest: {
            type: "fluid.test.nexus.readDefaultsRequest",
            options: {
                termMap: {
                    gradeName: "{tests}.options.testGradeName"
                }
            }
        },
        readDefaultsSecondTimeRequest: {
            type: "fluid.test.nexus.readDefaultsRequest",
            options: {
                termMap: {
                    gradeName: "{tests}.options.testGradeName"
                }
            }
        },
        readDefaultsThirdTimeRequest: {
            type: "fluid.test.nexus.readDefaultsRequest",
            options: {
                termMap: {
                    gradeName: "{tests}.options.testGradeName"
                }
            }
        },
        writeDefaultsRequest: {
            type: "fluid.test.nexus.writeDefaultsRequest",
            options: {
                termMap: {
                    gradeName: "{tests}.options.testGradeName"
                }
            }
        },
        writeDefaultsAgainRequest: {
            type: "fluid.test.nexus.writeDefaultsRequest",
            options: {
                termMap: {
                    gradeName: "{tests}.options.testGradeName"
                }
            }
        },
        constructComponentRequest: {
            type: "fluid.test.nexus.constructComponentRequest",
            options: {
                termMap: {
                    path: "{tests}.options.testComponentPath"
                }
            }
        },
        constructComponentRequest2: {
            type: "fluid.test.nexus.constructComponentRequest",
            options: {
                termMap: {
                    path: "{tests}.options.testComponentPath2"
                }
            }
        },
        destroyComponentRequest: {
            type: "fluid.test.nexus.destroyComponentRequest",
            options: {
                termMap: {
                    path: "{tests}.options.testComponentPath"
                }
            }
        },
        destroyComponentRequest2: {
            type: "fluid.test.nexus.destroyComponentRequest",
            options: {
                termMap: {
                    path: "{tests}.options.testComponentPath2"
                }
            }
        },
        readComponentRequest1: {
            type: "fluid.test.nexus.readComponentRequest",
            options: {
                termMap: {
                    path: "{tests}.options.testComponentPath"
                }
            }
        },
        readComponentRequest2: {
            type: "fluid.test.nexus.readComponentRequest",
            options: {
                termMap: {
                    path: "{tests}.options.testComponentPath"
                }
            }
        },
        readComponentRequest3: {
            type: "fluid.test.nexus.readComponentRequest",
            options: {
                termMap: {
                    path: "{tests}.options.testComponentPath"
                }
            }
        }
    }
});
