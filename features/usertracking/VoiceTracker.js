"use strict";

const logger = moduleLoader.utils.logger();

const userIsMutedSpecification = require("./specification/UserMutedSpecification");

/**
 * Activity Map
 *   Type: Object (Dynamic Structure)
 *   Keys: User ID
 *   Values: Activity Object
 *
 * Activity
 *   Type: Object (Static Structure)
 *   Key 1: State
 *   Value 1: State Object
 *   Key 2: Channels
 *   Value 2: Channel Object
 *
 * Channel
 *   Type: Object (Dynamic Structure)
 *   Keys: Channel ID
 *   Values: Time spent in channel
 */
let activityMap = {};

function Activity() {
    return {
        state: {
            lastVoiceUpdate: Date.now(),
            currentVoiceChannel: null
        },
        channels: {}
    }
}

function registerVoiceEnter(newMember) {
    let userActivity = activityMap[newMember.id];
    userActivity.state.lastVoiceUpdate = Date.now();
    userActivity.state.currentVoiceChannel = newMember.channelId;
    logger.info("Voice entered");
}

function registerChannelSwitch(oldMember, newMember) {
    registerVoiceLeave(oldMember);
    registerVoiceEnter(newMember);
    logger.info("Voice channel switched");
}

function registerVoiceLeave(oldMember) {
    const userActivity = activityMap[oldMember.id];
    const currentVoiceChannel = userActivity.state.currentVoiceChannel;

    if (currentVoiceChannel == null) {
        return;
    }

    const timestamp = Date.now();
    const channels = userActivity.channels;
    const lastVoiceUpdate = userActivity.state.lastVoiceUpdate;

    if (channels[currentVoiceChannel] != null) {
        channels[currentVoiceChannel].timeInVoice += timestamp - lastVoiceUpdate;
    } else {
        channels[currentVoiceChannel] = {
            timeInVoice: timestamp - lastVoiceUpdate
        };
    }
    userActivity.state.lastVoiceUpdate = timestamp;
    userActivity.state.currentVoiceChannel = null;

    logger.info("Voice left");
}

function registerUserMute(newMember) {
    let userActivity = activityMap[newMember.id];
    if (userActivity.state.currentVoiceChannel != null){
        registerVoiceLeave(newMember);
    }
    logger.info("User muted");
}

function registerUserUnmute(newMember) {
    registerVoiceEnter(newMember);
    logger.info("User no longer muted");
}

function didJoinChannel(newMember) {
    return newMember.channelId != null;
}

function wasInChannel(oldMember) {
    return oldMember.channelId != null;
}

function enteredDifferentChannel(newMember, oldMember) {
    return newMember.channelId !== oldMember.channelId;
}

function handleVoiceEvent(oldMember, newMember) {

    let userId = newMember.id;
    if (activityMap[userId] == null) {
        activityMap[userId] = new Activity();
    }

    if (userIsMutedSpecification.isSatisfiedBy(newMember)) {
        if (didJoinChannel(newMember)) {
            if (wasInChannel(oldMember)) {
                if (enteredDifferentChannel(newMember, oldMember)) {
                    registerChannelSwitch(oldMember, newMember);
                } else if (!userIsMutedSpecification.isSatisfiedBy(oldMember)) {
                    registerUserUnmute(newMember);
                }
            } else {
                registerVoiceEnter(newMember);
            }
        } else {
            registerVoiceLeave(oldMember);
        }
    } else if (userIsMutedSpecification.isSatisfiedBy(oldMember)) {
        registerUserMute(newMember);
    }

}

function getData(){
    return activityMap;
}

function resetCounters(){
    const activities = Object.values(activityMap);
    for (let activity of activities){
        activity.channels = {};
        if (activity.state.currentVoiceChannel != null){
            activity.state.lastVoiceUpdate = Date.now();
        }
    }
}

function VoiceTracker() {

    return {
        handleVoiceEvent,
        getData,
        resetCounters
    }

}

module.exports = VoiceTracker();