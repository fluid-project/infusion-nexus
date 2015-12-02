"use strict";

var fluid = require("infusion"),
    kettle = fluid.registerNamespace("kettle");

require("kettle");
require("./src/Nexus.js");

kettle.config.makeConfigLoader({
    configName: kettle.config.getNodeEnv("gpii.nexus.config"),
    configPath: __dirname // TODO: kettle.config.getConfigPath() ||
});
