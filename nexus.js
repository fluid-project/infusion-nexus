"use strict";

var fluid = require("infusion"),
    kettle = fluid.registerNamespace("kettle");

require("kettle");
require("./src/Nexus.js");

kettle.config.loadConfig({
    configName: kettle.config.getNodeEnv("gpii.nexus.config"),
    configPath: kettle.config.getConfigPath(__dirname)
});
