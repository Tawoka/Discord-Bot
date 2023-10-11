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

//TODO switch to hours later
let hourOfLastCall = new Date().getMinutes();
let statisticsAreTransmitted = false;
let messageEvents = [];
let voiceEvents = [];

function init(){
    client.guilds.fetch(process.env.serverId)
        .then(guild => {
            logger.debug(guild.channels);
        })
        .catch(error => {
            logger.error("Initializing VoiceTracking failed");
            logger.error(error);
        });
}

function clearCache(){
    messageTracker.resetCounters();
    voiceTracker.resetCounters();
    logger.info("clearing cache");
}

async function sendStatistics(){
    const success = await activityCompiler.compile();
    if (success) {
        clearCache();
    }
}

function isNewHour(){
    let currentHour = new Date().getMinutes();
    return hourOfLastCall !== currentHour;
}

function updateHourOfLastCall(){
    hourOfLastCall = new Date().getMinutes();
}

function handleMessageEvent(messageEvent) {
    if (!messageSpecification.isSatisfiedBy(messageEvent)) {
        return;
    }
    if (!security.isConnectedServer(messageEvent.guildId)) {
        logger.error("Received message originates from another server");
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
        logger.error("Received voice event originates from another server");
        return;
    }
    voiceTracker.handleVoiceEvent(oldMember, newMember);
}

async function handleAPICallAfterMessageEvent() {
    statisticsAreTransmitted = true;
    await sendStatistics();
    statisticsAreTransmitted = false;
    await messageEvents.forEach(registerMessage);
    messageEvents = [];
    updateHourOfLastCall();
}

async function handleAPICallAfterVoiceEvent() {
    statisticsAreTransmitted = true;
    await sendStatistics();
    statisticsAreTransmitted = false;
    await voiceEvents.forEach(entry => registerVoiceUpdate(entry[0], entry[1]));
    voiceEvents = [];
    updateHourOfLastCall();
}

async function registerMessage(messageEvent) {
    if (statisticsAreTransmitted){
        messageEvents.push(messageEvent);
        return;
    }

    if (!isNewHour()) {
        handleMessageEvent(messageEvent);
    } else {
        await handleAPICallAfterMessageEvent();
    }
}

async function registerVoiceUpdate(oldMember, newMember) {
    if (statisticsAreTransmitted){
        voiceEvents.push([oldMember, newMember]);
        return;
    }

    if (!isNewHour()) {
        handleVoiceEvent(oldMember, newMember);
    } else {
        await handleAPICallAfterVoiceEvent();
    }
}

const UserActivityTracking = function (){

    return {
        init,
        registerMessage,
        registerVoiceUpdate
    }

}

module.exports = UserActivityTracking();