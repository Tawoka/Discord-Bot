"use strict";

const {Events} = require('discord.js');

// const statistics = moduleLoader.features.userActivityTracking();
// const logger = moduleLoader.utils.logger();

module.exports = {
    name: Events.VoiceStateUpdate,
    once: false,
    async execute(oldMember, newMember) {
        // logger.info("Voice event received");
        // await statistics.registerVoiceUpdate(oldMember, newMember);
    }

}