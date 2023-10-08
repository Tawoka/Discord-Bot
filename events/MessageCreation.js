"use strict";

const {Events} = require('discord.js');

const statistics = moduleLoader.features.userActivityTracking();
const logger = moduleLoader.utils.logger();

module.exports = {
    name: Events.MessageCreate,
    once: false,
    async execute(message) {
        logger.info("Message event received");
        await statistics.registerMessage(message);
    }

}