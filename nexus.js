"use strict";

var kettle = require("kettle");

require("./index.js");

kettle.config.loadConfig({
    configName: kettle.config.getNodeEnv("gpii.nexus.config"),
    configPath: kettle.config.getConfigPath("%gpii-nexus/configs")
});
