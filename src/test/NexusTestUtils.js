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
    // TODO: Switch over to kettle.test.assertJSONResponse
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

fluid.defaults("gpii.test.nexus.testCaseHolder", {
    gradeNames: "kettle.test.testCaseHolder",
    components: {
        readDefaultsRequest: {
            type: "kettle.test.request.http",
            options: {
                path: "/defaults/%gradeName",
                port: 8081,
                termMap: {
                    gradeName: "{tests}.options.testGradeName"
                }
            }
        },
        writeDefaultsRequest: {
            type: "kettle.test.request.http",
            options: {
                path: "/defaults/%gradeName",
                port: 8081,
                method: "PUT",
                termMap: {
                    gradeName: "{tests}.options.testGradeName"
                }
            }
        }
    }
});
