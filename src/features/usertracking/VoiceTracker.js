"use strict";

const logger = moduleLoader.utils.logger();

const userIsNotMutedSpecification = require("./specification/UserNotMutedSpecification");

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

/**
 * This action was built as an alternate route to registering all active users when the bot starts.
 * Unfortunately the library/API does not provide the ability to request the status quo of the server.
 * For whatever reason, I can only fetch specific elements by ID, and do not receive related elements. For example, I
 * fetched the guild, using the guildId, but did not receive all available channels or members with it. Hence, I was
 * unable to loop over the list of existing voice channels to check for members being active there.
 *
 * Another method explored was to use the channel list I retrieve from the backend. However, this list is not
 * synchronized with discord, as this bot has the duty to update it with new channels, once they appear. Using this list
 * would therefore create blind spots in the tracking.
 *
 * Instead, this path now extrapolates the user's activity. The user who triggered the current event is yet unknown to
 * the bot. Meaning we had no record of him so far. Should the "oldMember", which represents the source state, show that
 * the user was in a channel before this event and was not muted, the user must have been active at the time the bot
 * started. We therefore set their "lastVoiceUpdate" state to the startup time of the bot, instead of Date.now()
 */
function handleVoiceActivityOnBotStart(oldMember) {
    if (wasInChannel(oldMember) && userIsNotMutedSpecification.isSatisfiedBy(oldMember)) {
        activityMap[oldMember.id].state.lastVoiceUpdate = getStartupTime();
    }
}

function handleNewEntry(oldMember) {
    const userId = oldMember.id;
    if (activityMap[userId] == null) {
        activityMap[userId] = new Activity();
        handleVoiceActivityOnBotStart(oldMember);
    }
}

function userSwitchedChannel(oldMember, newMember){
    return didJoinChannel(newMember) && wasInChannel(oldMember) && enteredDifferentChannel(newMember, oldMember);
}

function userEnteredVoice(oldMember, newMember){
    return didJoinChannel(newMember) && !wasInChannel(oldMember);
}

function userLeftVoice(oldMember, newMember){
    return wasInChannel(oldMember) && !didJoinChannel(newMember);
}

function userMuted(oldMember, newMember){
    return userIsNotMutedSpecification.isSatisfiedBy(oldMember) && !userIsNotMutedSpecification.isSatisfiedBy(newMember);
}

function userRemovedMute(oldMember, newMember){
    return userIsNotMutedSpecification.isSatisfiedBy(newMember) && !userIsNotMutedSpecification.isSatisfiedBy(oldMember);
}

function handleVoiceEvent(oldMember, newMember) {

    handleNewEntry(oldMember);
    if (userMuted(oldMember, newMember)){
        registerUserMute(newMember);
    } else if (userRemovedMute(oldMember, newMember)){
        registerUserUnmute(newMember);
    } else if (userEnteredVoice(oldMember, newMember)){
        registerVoiceEnter(newMember);
    } else if (userLeftVoice(oldMember, newMember)){
        registerVoiceLeave(oldMember);
    } else if (userSwitchedChannel(oldMember, newMember)){
        registerChannelSwitch(oldMember, newMember);
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
        /**
         * This function parses the incoming voice events (source state and target state)
         * As long as the user came from a legal state (see voice specifications), the time since the last event will be
         * calculated and added to their time they spent in this voice channel.
         */
        handleVoiceEvent,
        /**
         * Get all the current data from the voice tracker, so it can be sent to the server
         */
        getData,
        /**
         * Reset the data, but do not delete the cache, so that user data from currently active users is not lost
         */
        resetCounters
    }

}

module.exports = VoiceTracker();