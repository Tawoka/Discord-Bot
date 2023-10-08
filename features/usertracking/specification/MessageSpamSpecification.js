"use strict";

const THREE_SECONDS = 3000;

function isSatisfiedBy(messageTimeStamp, lastMessageTimeStamp){

    return messageTimeStamp - lastMessageTimeStamp < THREE_SECONDS;

}

module.exports = {isSatisfiedBy};