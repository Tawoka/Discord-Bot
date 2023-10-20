"use strict";

const logger = moduleLoader.utils.logger();

const security = moduleLoader.utils.security();

const messageTracker = require("./MessageTracker");
const voiceTracker = require("./VoiceTracker");
const userTracker = require("./UserTracker");
const channelTracker = require("./ChannelTracker");
const activityCompiler = require("./ActivityCompiler");
const messageSpecification = require("./specification/MessageEventSpecification");
const voiceSpecification = require("./specification/VoiceEventSpecification");

let hourOfLastCall = new Date().getHours();
let statisticsAreTransmitted = false;
let messageEvents = [];
let voiceEvents = [];

function clearCache() {
    messageTracker.resetCounters();
    voiceTracker.resetCounters();
    logger.info("clearing cache");
}

async function sendStatistics() {
    const success = await activityCompiler.compile();
    if (success) {
        clearCache();
    }
}

function isNewHour() {
    let currentHour = new Date().getMinutes();
    return hourOfLastCall !== currentHour;
}

function updateHourOfLastCall() {
    hourOfLastCall = new Date().getMinutes();
}

function handleMessageEvent(messageEvent) {
    if (!messageSpecification.isSatisfiedBy(messageEvent)) {
        return;
    }
    if (!security.isConnectedServer(messageEvent.guildId)) {
        logger.info("Received message originates from another server");
        return;
    }
    userTracker.trackUser(messageEvent.author.id);
    channelTracker.trackChannel(messageEvent.channelId);
    messageTracker.handleMessageEvent(messageEvent);
    logger.info("Message received");
}

function handleVoiceEvent(oldMember, newMember) {
    if (!voiceSpecification.isSatisfiedBy(oldMember) || !voiceSpecification.isSatisfiedBy(newMember)) {
        logger.debug("Skipping voice event, since specification has not been satisfied");
        return;
    }
    if (!security.isConnectedServer(newMember.guild.id)) {
        logger.info("Received voice event originates from another server");
        return;
    }
    userTracker.trackUser(newMember.id);
    channelTracker.trackChannel(newMember.channelId);
    voiceTracker.handleVoiceEvent(oldMember, newMember);
}

async function performUploadProcess() {
    statisticsAreTransmitted = true;
    await sendStatistics();
    statisticsAreTransmitted = false;
}

async function executeCachedEvents() {
    await messageEvents.forEach(registerMessage);
    messageEvents = [];
    await voiceEvents.forEach(entry => registerVoiceUpdate(entry[0], entry[1]));
    voiceEvents = [];
}

async function handleAPICall() {
    await performUploadProcess();
    await executeCachedEvents();
    updateHourOfLastCall();
}

async function registerMessage(messageEvent) {
    if (statisticsAreTransmitted) {
        messageEvents.push(messageEvent);
        return;
    }

    if (!isNewHour()) {
        handleMessageEvent(messageEvent);
    } else {
        messageEvents.push(messageEvent);
        await handleAPICall();
    }
}

async function registerVoiceUpdate(oldMember, newMember) {
    if (statisticsAreTransmitted) {
        voiceEvents.push([oldMember, newMember]);
        return;
    }

    if (!isNewHour()) {
        handleVoiceEvent(oldMember, newMember);
    } else {
        voiceEvents.push([oldMember, newMember]);
        await handleAPICall();
    }
}

const UserActivityTracking = function () {

    return {
        /**
         * Register any new message that was written on the server. All message events get here, but have to pass the
         * checks to be parsed.
         */
        registerMessage,
        /**
         * Register any change in a users Voice State on the server. All voice events get here, but have to pass the
         * checks to be parsed.
         */
        registerVoiceUpdate
    }

}

module.exports = UserActivityTracking();