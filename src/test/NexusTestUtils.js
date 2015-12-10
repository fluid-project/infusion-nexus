"use strict";

var fluid = require("infusion"),
    gpii = fluid.registerNamespace("gpii"),
    jqUnit = fluid.require("node-jqunit");

fluid.registerNamespace("gpii.test.nexus");

gpii.test.nexus.verifyReadDefaultsResponse = function (body, request, expectedGradeNames) {
    // TODO: Switch over to kettle.test.assertJSONResponse
    var responseGradeSpec = JSON.parse(body);
    var response = request.nativeResponse;
    jqUnit.assertEquals("Response has 200 status code", 200, response.statusCode);
    jqUnit.assertTrue("Response has JSON content-type",
                      response.headers["content-type"].indexOf("application/json") === 0);
    fluid.each(expectedGradeNames, function (gradeName) {
        jqUnit.assertTrue("Read Defaults response has grade " + gradeName,
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
        }
    }
});
