/*
Copyright 2015 OCAD University

Licensed under the New BSD license. You may not use this file except in
compliance with this License.

You may obtain a copy of the License at
https://raw.githubusercontent.com/simonbates/nexus/master/LICENSE.txt
*/

/* global module */

"use strict";

module.exports = function (grunt) {

    grunt.initConfig({
        jshint: {
            all: ["**/*.js"],
            options: {
                jshintrc: true
            }
        },
        jsonlint: {
            all: ["package.json", ".jshintrc", "src/**/*.json", "tests/**/*.json", "configs/**/*.json"]
        },
        shell: {
            options: {
                stdout: true,
                srderr: true,
                failOnError: true
            },
            runTests: {
                command: "vagrant ssh -c 'DISPLAY=:0 node /home/vagrant/sync/tests/all-tests.js'"
            }
        }
    });

    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-jsonlint");
    grunt.loadNpmTasks("grunt-shell");

    grunt.registerTask("default", ["lint"]);
    grunt.registerTask("lint", "Run jshint and jsonlint", ["jshint", "jsonlint"]);
    grunt.registerTask("tests", "Run Nexus tests", ["shell:runTests"]);
};
