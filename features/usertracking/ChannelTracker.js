"use strict";

const logger = moduleLoader.utils.logger();
const apiClient = moduleLoader.client.databaseRestAPI();

async function loadChannelFromDiscord(channelId){
    const guild = await client.guilds.fetch(process.env.serverId);
    return guild.channels.cache.get(channelId);
}

function trackChannel(channelId){
    if (!channelList.includes(channelId)){
        logger.info("New channel registered");
        loadChannelFromDiscord(channelId).then(channel =>
                apiClient.registerNewChannel(channel).then(() => channelList.push(channelId)).catch(error => logger.error(error))
            );
    }
}

function ChannelTracker(){

    return {
        trackChannel
    }

}

module.exports = ChannelTracker();