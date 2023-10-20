"use strict";

const spamSpecification = require("./specification/MessageSpamSpecification");

let activityMap = {};

function Activity() {
    return {
        state: {
            lastMessageTimestamp: null
        },
        channels: {}
    }
}

function registerValidMessage(messageEvent) {
    const userId = messageEvent.author.id;
    const activity = activityMap[userId];
    const channels = activity.channels;
    const channelId = messageEvent.channelId;

    if (channels[channelId] != null) {
        channels[channelId]++;
    } else {
        channels[channelId] = 1;
    }
    activity.state.lastMessageTimestamp = messageEvent.createdTimestamp;
}

function handleNewUser(userId) {
    if (activityMap[userId] == null) {
        activityMap[userId] = new Activity();
    }
}

function spamDetected(messageEvent, userId){
    const messageTimestamp = messageEvent.createdTimestamp;
    const lastMessageTimestamp = activityMap[userId].state.lastMessageTimestamp;
    return spamSpecification.isSatisfiedBy(messageTimestamp, lastMessageTimestamp);
}

function handleMessageEvent(messageEvent) {
    const userId = messageEvent.author.id;
    handleNewUser(userId);
    if (!spamDetected(messageEvent, userId)){
        registerValidMessage(messageEvent);
    }
}

function getData(){
    return activityMap;
}

function resetCounters(){
    const activities = Object.values(activityMap);
    for (let activity of activities){
        activity.channels = {};
    }
}

function MessageTracker() {

    return{
        /**
         * This function parses the given message event.
         * It will create a map entry for the combination of userId and channelId, if it does not already exist
         * For each message created, the map entry will increase its value by 1
         */
        handleMessageEvent,
        /**
         * Retrieve the data from this tracker, so it can be sent to the server.
         */
        getData,
        /**
         * Reset the data in the tracker, but not the cache itself, so we don't lose the users themselves.
         */
        resetCounters
    }

}

module.exports = MessageTracker();