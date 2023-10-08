"use strict";

const utils = moduleLoader.utils.utils();

function isSatisfiedBy(message){
    if (!checkMandatoryFieldsAreSet(message)){
        return false;
    }
    return message.interaction == null;

}

function checkMandatoryFieldsAreSet(message){
    if (!fieldIsSet(message.channelId)){
        return false;
    }
    if (!fieldIsSet(message.guildId)){
        return false;
    }
    if (!fieldIsSet(message.id)){
        return false;
    }
    if (!fieldIsSet(message.author) || !fieldIsSet(message.author.id)){
        return false;
    }
    return !message.author.bot;
}

function fieldIsSet(field){
    return field || utils.isEmpty(field);
}

module.exports = {
    isSatisfiedBy
}