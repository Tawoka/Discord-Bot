"use strict";

const utils = moduleLoader.utils.utils();
const logger = moduleLoader.utils.logger();
const databaseClient = moduleLoader.client.databaseRestAPI();

const voiceTracker = require("./VoiceTracker");
const messageTracker = require("./MessageTracker");

const THIRTY_MINUTES = 30 * 60 * 1000;
const NAME_OF_FUTURE = "retrySendingStats";

let attemptRetry = true;

function parseTimeIntoSeconds(time){
    if (!time){
        return 0;
    }
    return time / 1000;
}

function handleOngoingVoiceActivity(voiceData){
    for (let activity of Object.values(voiceData)){
        let currentChannel = activity.state.currentVoiceChannel;
        if (currentChannel != null){
            activity.channels[currentChannel] += Date.now() - activity.state.lastVoiceUpdate;
        }
    }
}

function buildUserList(messageData, voiceData){
    return utils.merge(Object.keys(messageData), Object.keys(voiceData));
}

function buildChannelList(messageChannels, voiceChannels){
    return utils.merge(Object.keys(messageChannels), Object.keys(voiceChannels));
}

function mergeDataForUser(userId, messageData, voiceData) {
    let data = [];
    const messageEntry = messageData[userId];
    const voiceEntry = voiceData[userId];
    const channelList = buildChannelList(messageEntry.channels, voiceEntry.channels);
    for (let channelId of channelList) {
        if (voiceEntry[channelId] != null && messageEntry[channelId] != null) {
            let entry = {
                userDiscordId: userId,
                discordChannelId: channelId,
                messageCount: messageEntry[channelId],
                voiceActivity: parseTimeIntoSeconds(voiceEntry[channelId])
            }
            data.push(entry);
        } else if (messageEntry[channelId] != null) {
            let entry = {
                userDiscordId: userId,
                discordChannelId: channelId,
                messageCount: messageEntry[channelId],
                voiceActivity: null
            }
            data.push(entry);
        } else {
            let entry = {
                userDiscordId: userId,
                discordChannelId: channelId,
                messageCount: null,
                voiceActivity: parseTimeIntoSeconds(voiceEntry[channelId])
            }
            data.push(entry);
        }
    }
    return data;
}

function buildStatisticObject(messageData, voiceData){
    const data = [];
    const userList = buildUserList(messageData, voiceData);
    for (let userId of userList){
        if (voiceData[userId] != null && messageData[userId] != null){
            let userData = mergeDataForUser(userId, messageData, voiceData);
            data.concat(userData);
        } else if (messageData[userId] != null){
            const messageEntry = messageData[userId];
            for (let channelId in messageEntry.channels){
                data.push({
                    userDiscordId: userId,
                    discordChannelId: channelId,
                    messageCount: messageEntry.channels[channelId],
                    voiceActivity: null
                });
            }
        } else {
            const voiceEntry = voiceData[userId];
            for (let channelId in voiceEntry.channels){
                data.push({
                    userDiscordId: userId,
                    discordChannelId: channelId,
                    messageCount: null,
                    voiceActivity: parseTimeIntoSeconds(voiceEntry.channels[channelId])
                });
            }
        }
    }

    return data;
}

async function buildChannelData(channelList){
    const guild = await client.guilds.fetch(process.env.serverId);
    let data = [];
    for (let channelId of channelList){
        let channel = guild.channels.cache.get(channelId);
        data.push({
            discordChannelId: channelId,
            discordChannelParentId: channel.parent.id,
            discordChannelName: channel.name
        });
    }
    return data;
}

function retrieveChannelList(dataArray){
    const channelSet = new Set();
    for (let dataEntry of dataArray){
        channelSet.add(dataEntry.discordChannelId);
    }
    return [...channelSet];
}

function resend(data) {
    logger.bot(`Attempting another call in 30 minutes`);
    setTimeout(() => {
        databaseClient.sendUserStats(data)
            .then((response) => {
                if (response.data.statusId === 1) {
                    logger.bot(`Attempt to resend data successful`);
                } else {
                    logger.bot(`Failed to send statistics twice. Data could not be sent`);
                }
            })
            .catch((error) => {
                logger.bot(`Failed to send statistics twice. Data could not be sent`);
            });
    }, THIRTY_MINUTES, NAME_OF_FUTURE);
}

function callFailed(error, data) {
    logger.error(error);
    logger.bot(`Sending tracking data failed`);
    if (attemptRetry){
        attemptRetry = false;
        resend(data);
    }
}

function countTotalMessages(stats){
    let count = 0;
    for (let entry of stats){
        count += entry.messageCount;
    }
    return count;
}

function countTotalTimeInVoice(stats){
    let count = 0;
    for (let entry of stats){
        count += entry.voiceActivity;
    }
    return count;
}

async function compile() {
    const voiceData = voiceTracker.getData();
    handleOngoingVoiceActivity(voiceData);
    const messageData = messageTracker.getData();
    const stats = buildStatisticObject(messageData, voiceData);

    const channelList = retrieveChannelList(stats);
    const channelData = await buildChannelData(channelList);

    try {
        attemptRetry = true;
        await databaseClient.sendChannelData(channelData);
        const response = await databaseClient.sendUserStats(stats);

        if (response.data.statusId === 1){
            logger.info(response);
            logger.bot(`Tracking data has been sent. A total of ${countTotalMessages(stats)} messages, and a total of ${countTotalTimeInVoice(stats)} voice seconds have been recorded.`);
            return true;
        }else {
            callFailed(response, stats);
            return false;
        }
    } catch (error) {
        callFailed(error, stats);
        return false;
    }
}

function ActivityCompiler() {

    return {
        compile
    }

}

module.exports = ActivityCompiler();