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

function addTimeSinceLastUpdateToVoiceCounter(activity, currentChannel) {
    activity.channels[currentChannel] += Date.now() - activity.state.lastVoiceUpdate;
}

function handleOngoingVoiceActivity(voiceData){
    for (let activity of Object.values(voiceData)){
        let currentChannel = activity.state.currentVoiceChannel;
        if (currentChannel != null){
            addTimeSinceLastUpdateToVoiceCounter(activity, currentChannel);
        }
    }
}

function buildUserList(messageData, voiceData){
    return utils.merge(Object.keys(messageData), Object.keys(voiceData));
}

function buildChannelList(messageChannels, voiceChannels){
    return utils.merge(Object.keys(messageChannels), Object.keys(voiceChannels));
}

function voiceAndMessageDataFound(voiceEntry, channelId, messageEntry) {
    return voiceEntry[channelId] != null && messageEntry[channelId] != null;
}

function messageDataFound(messageEntry, channelId) {
    return messageEntry[channelId] != null;
}

function voiceDataFound(voiceEntry, channelId) {
    return voiceEntry[channelId] != null;
}

function createFullEntry(userId, channelId, messageCount, voiceCount) {
    return {
        userDiscordId: userId,
        discordChannelId: channelId,
        messageCount: messageCount,
        voiceActivity: voiceCount
    };
}

function createMessageEntry(userId, channelId, messageCount) {
    return createFullEntry(userId, channelId, messageCount, null);
}

function createVoiceEntry(userId, channelId, voiceCount) {
    return createFullEntry(userId, channelId, null, voiceCount);
}

function buildDataObject(channelList, voiceEntry, messageEntry, userId) {
    let data = [];
    for (let channelId of channelList) {
        if (voiceAndMessageDataFound(voiceEntry, channelId, messageEntry)) {
            const entry= createFullEntry(userId, channelId, messageEntry[channelId], parseTimeIntoSeconds(voiceEntry[channelId]));
            data.push(entry);
        } else if (messageDataFound(messageEntry, channelId)) {
            const entry= createMessageEntry(userId, channelId, messageEntry[channelId]);
            data.push(entry);
        } else if (voiceDataFound(voiceEntry, channelId)){
            const entry= createVoiceEntry(userId, channelId, parseTimeIntoSeconds(voiceEntry[channelId]));
            data.push(entry);
        }
    }
    return data;
}

function mergeDataForUser(userId, messageData, voiceData) {
    const messageEntry = messageData[userId];
    const voiceEntry = voiceData[userId];
    const channelList = buildChannelList(messageEntry.channels, voiceEntry.channels);
    return buildDataObject(channelList, voiceEntry, messageEntry, userId);
}

function buildStatisticObject(userList, messageData, voiceData) {
    const data = [];
    for (let userId of userList) {
        let userData = mergeDataForUser(userId, messageData, voiceData);
        data.concat(userData);
    }
    return data;
}

function buildUserStatisticObject(messageData, voiceData){
    const userList = buildUserList(messageData, voiceData);
    return buildStatisticObject(userList, messageData, voiceData);
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

function createStatistics() {
    const voiceData = voiceTracker.getData();
    handleOngoingVoiceActivity(voiceData);
    const messageData = messageTracker.getData();
    return buildUserStatisticObject(messageData, voiceData);
}

function callSuccessful(response) {
    return response.data.statusId === 1;
}

function createDiscordNotification(stats) {
    logger.bot(`Tracking data has been sent. A total of ${countTotalMessages(stats)} messages, and a total of ${countTotalTimeInVoice(stats)} voice seconds have been recorded.`);
}

function handleResponse(response, stats) {
    if (callSuccessful(response)) {
        logger.debug(response);
        createDiscordNotification(stats);
        return true;
    } else {
        callFailed(response, stats);
        return false;
    }
}

async function compile() {
    const stats = createStatistics();
    try {
        attemptRetry = true;
        const response = await databaseClient.sendUserStats(stats);
        return handleResponse(response, stats);
    } catch (error) {
        callFailed(error, stats);
        return false;
    }
}

function ActivityCompiler() {

    return {
        /**
         * Compiles the data for the server from the individual trackers.
         */
        compile
    }

}

module.exports = ActivityCompiler();