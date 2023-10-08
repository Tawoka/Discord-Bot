"use strict";

const {EmbedBuilder} = require("discord.js");
const logLevel = process.env.logLevel;

function error(message) {
    console.log(message);
}

function debug(message){
    if (logLevel >= 4){
        console.log(message);
    }
}

function warning(message) {
    if (logLevel >= 2) {
        console.log(message);
    }
}

function info(message) {
    if (logLevel >= 3){
        console.log(message);
    }
}

function trace(message){
    if (logLevel >= 5){
        console.log(message);
    }
}

function bot(message) {
    client.channels.fetch(process.env.SEMPER_LOG_CHANNEL).then(channel => {
        channel.send(message);
    });
}

function Logger() {

    return {
        error,
        warning,
        info,
        debug,
        trace,
        bot
    }

}

module.exports = Logger();