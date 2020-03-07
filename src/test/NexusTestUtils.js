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

fluid.defaults("fluid.test.nexus.testCaseHolder", {
    gradeNames: "kettle.test.testCaseHolder",
    components: {
        readDefaultsRequest: {
            type: "kettle.test.request.http",
            options: {
                path: "/defaults/%gradeName",
                port: "{configuration}.options.serverPort",
                termMap: {
                    gradeName: "{tests}.options.testGradeName"
                }
            }
        },
        readDefaultsSecondTimeRequest: {
            type: "kettle.test.request.http",
            options: {
                path: "/defaults/%gradeName",
                port: "{configuration}.options.serverPort",
                termMap: {
                    gradeName: "{tests}.options.testGradeName"
                }
            }
        },
        readDefaultsThirdTimeRequest: {
            type: "kettle.test.request.http",
            options: {
                path: "/defaults/%gradeName",
                port: "{configuration}.options.serverPort",
                termMap: {
                    gradeName: "{tests}.options.testGradeName"
                }
            }
        },
        writeDefaultsRequest: {
            type: "kettle.test.request.http",
            options: {
                path: "/defaults/%gradeName",
                port: "{configuration}.options.serverPort",
                method: "PUT",
                termMap: {
                    gradeName: "{tests}.options.testGradeName"
                }
            }
        },
        writeDefaultsAgainRequest: {
            type: "kettle.test.request.http",
            options: {
                path: "/defaults/%gradeName",
                port: "{configuration}.options.serverPort",
                method: "PUT",
                termMap: {
                    gradeName: "{tests}.options.testGradeName"
                }
            }
        },
        constructComponentRequest: {
            type: "kettle.test.request.http",
            options: {
                path: "/components/%path",
                port: "{configuration}.options.serverPort",
                method: "POST",
                termMap: {
                    path: "{tests}.options.testComponentPath"
                }
            }
        },
        constructComponentRequest2: {
            type: "kettle.test.request.http",
            options: {
                path: "/components/%path",
                port: "{configuration}.options.serverPort",
                method: "POST",
                termMap: {
                    path: "{tests}.options.testComponentPath2"
                }
            }
        },
        destroyComponentRequest: {
            type: "kettle.test.request.http",
            options: {
                path: "/components/%path",
                port: "{configuration}.options.serverPort",
                method: "DELETE",
                termMap: {
                    path: "{tests}.options.testComponentPath"
                }
            }
        },
        destroyComponentRequest2: {
            type: "kettle.test.request.http",
            options: {
                path: "/components/%path",
                port: "{configuration}.options.serverPort",
                method: "DELETE",
                termMap: {
                    path: "{tests}.options.testComponentPath2"
                }
            }
        }
    }
});
