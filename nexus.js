/*
Copyright 2015, 2016 OCAD University

Licensed under the New BSD license. You may not use this file except in
compliance with this License.

You may obtain a copy of the License at
https://raw.githubusercontent.com/fluid-project/infusion-nexus/master/LICENSE.txt
*/

/* eslint-env node */

"use strict";

var kettle = require("kettle");

require("./index.js");

kettle.config.loadConfig({
    configName: kettle.config.getConfigName("fluid.nexus.config"),
    configPath: kettle.config.getConfigPath("%infusion-nexus/configs")
});
