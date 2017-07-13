/*
Copyright 2017 OCAD University

Licensed under the New BSD license. You may not use this file except in
compliance with this License.

You may obtain a copy of the License at
https://raw.githubusercontent.com/GPII/nexus/master/LICENSE.txt
*/

/* eslint-env node */

"use strict";

var fluid = require("infusion"),
    gpii = fluid.registerNamespace("gpii");

fluid.registerNamespace("gpii.nexus");

gpii.nexus.absComponentPath = function (container, path) {
    var segs = (typeof(path) === "string" ? fluid.pathUtil.parseEL(path) : path);
    var containerPath = fluid.pathForComponent(container);
    return fluid.makeArray(containerPath).concat(segs);
};

gpii.nexus.componentForPathInContainer = function (container, path) {
    return fluid.componentForPath(gpii.nexus.absComponentPath(container, path));
};

gpii.nexus.containsComponent = function (container, path) {
    return fluid.isValue(gpii.nexus.componentForPathInContainer(container, path));
};

gpii.nexus.constructInContainer = function (container, path, options) {
    return fluid.construct(gpii.nexus.absComponentPath(container, path), options);
};

gpii.nexus.destroyInContainer = function (container, path) {
    return fluid.destroy(gpii.nexus.absComponentPath(container, path));
};
