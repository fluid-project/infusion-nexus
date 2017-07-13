/*
Copyright 2015, 2016, 2017 OCAD University

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

fluid.registerNamespace("gpii.test.nexus");

gpii.test.nexus.assertStatusCode = function (request, statusCode) {
    var response = request.nativeResponse;
    jqUnit.assertEquals("Response has status code " + statusCode, statusCode, response.statusCode);
};

gpii.test.nexus.verifyReadDefaultsResponse = function (body, request, expectedGradeSpec) {
    // TODO: Switch over to the new assertion function of KETTLE-39
    var responseGradeSpec = JSON.parse(body);
    var response = request.nativeResponse;
    jqUnit.assertEquals("Response has status code 200", 200, response.statusCode);
    jqUnit.assertTrue("Response has JSON content-type",
                      response.headers["content-type"].indexOf("application/json") === 0);
    jqUnit.assertLeftHand("Response has expected grade specification", expectedGradeSpec, responseGradeSpec);
};

gpii.test.nexus.assertNoComponentAtPath = function (message, componentRoot, path) {
    jqUnit.assertFalse(message, gpii.nexus.containsComponent(componentRoot, path));
};

gpii.test.nexus.assertComponentModel = function (message, componentRoot, path, expectedModel) {
    var component = gpii.nexus.componentForPathInContainer(componentRoot, path);
    jqUnit.assertValue("Component exists", component);
    jqUnit.assertDeepEq(message, expectedModel, component.model);
};

gpii.test.nexus.assertNotContainsComponent = function (componentRoot, parentPath, childName) {
    var parent = gpii.nexus.componentForPathInContainer(componentRoot, parentPath);
    jqUnit.assertNoValue(parentPath + " component does not contain " + childName, parent[childName]);
};

gpii.test.nexus.assertContainsComponent = function (componentRoot, parentPath, childName) {
    var parent = gpii.nexus.componentForPathInContainer(componentRoot, parentPath);
    jqUnit.assertValue(parentPath + " component contains " + childName, parent[childName]);
};

gpii.test.nexus.changeModelAtPath = function (componentPath, modelPath, value) {
    fluid.componentForPath(componentPath).applier.change(modelPath, value);
};

gpii.test.nexus.changeEventForComponent = function (path) {
    return fluid.componentForPath(path).applier.modelChanged;
};

fluid.defaults("gpii.test.nexus.testCaseHolder", {
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
