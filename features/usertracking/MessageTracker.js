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

function handleMessageEvent(messageEvent) {
    const userId = messageEvent.author.id;
    if (activityMap[userId] == null) {
        activityMap[userId] = new Activity();
    } else if (spamSpecification.isSatisfiedBy(messageEvent.createdTimestamp,
        activityMap[userId].state.lastMessageTimestamp)) {
        return;
    }
    registerValidMessage(messageEvent);
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
        handleMessageEvent,
        getData,
        resetCounters
    }

}

module.exports = MessageTracker();