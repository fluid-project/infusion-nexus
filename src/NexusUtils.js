/*
Copyright 2017 OCAD University

Licensed under the New BSD license. You may not use this file except in
compliance with this License.

You may obtain a copy of the License at
https://raw.githubusercontent.com/fluid/infusion-nexus/master/LICENSE.txt
*/

/* eslint-env node */

"use strict";

var fluid = require("infusion");

fluid.registerNamespace("fluid.nexus");

fluid.nexus.absComponentPath = function (container, path) {
    var segs = (typeof(path) === "string" ? fluid.pathUtil.parseEL(path) : path);
    var containerPath = fluid.pathForComponent(container);
    return fluid.makeArray(containerPath).concat(segs);
};

fluid.nexus.componentForPathInContainer = function (container, path) {
    return fluid.componentForPath(fluid.nexus.absComponentPath(container, path));
};

fluid.nexus.containsComponent = function (container, path) {
    return fluid.isValue(fluid.nexus.componentForPathInContainer(container, path));
};

fluid.nexus.constructInContainer = function (container, path, options) {
    return fluid.construct(fluid.nexus.absComponentPath(container, path), options);
};

fluid.nexus.destroyInContainer = function (container, path) {
    return fluid.destroy(fluid.nexus.absComponentPath(container, path));
};
