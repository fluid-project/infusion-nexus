"use strict";

var fluid = require("infusion"),
    gpii = fluid.registerNamespace("gpii"),
    jqUnit = fluid.require("node-jqunit");

fluid.registerNamespace("gpii.test.nexus");

gpii.test.nexus.assertStatusCode = function (request, statusCode) {
    var response = request.nativeResponse;
    jqUnit.assertEquals("Response has status code " + statusCode, statusCode, response.statusCode);
};

gpii.test.nexus.verifyReadDefaultsResponse = function (body, request, expectedGradeNames) {
    // TODO: Switch over to the new assertion function of KETTLE-39
    var responseGradeSpec = JSON.parse(body);
    var response = request.nativeResponse;
    jqUnit.assertEquals("Response has status code 200", 200, response.statusCode);
    jqUnit.assertTrue("Response has JSON content-type",
                      response.headers["content-type"].indexOf("application/json") === 0);
    fluid.each(expectedGradeNames, function (gradeName) {
        jqUnit.assertTrue("Response has grade " + gradeName,
                          fluid.hasGrade(responseGradeSpec, gradeName));
    });
};

gpii.test.nexus.verifyComponentNotConstructed = function (path) {
    var component = gpii.nexus.componentForPath(path);
    jqUnit.assertNoValue("Component has not been constructed", component);
};

gpii.test.nexus.verifyComponentModel = function (path, expectedModel) {
    var component = gpii.nexus.componentForPath(path);
    jqUnit.assertValue("Component exists", component);
    jqUnit.assertDeepEq("Component model is as expected", expectedModel, component.model);
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
        }
    }
});
