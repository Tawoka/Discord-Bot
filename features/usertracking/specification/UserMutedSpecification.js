"use strict";

function isSatisfiedBy(event){

    return !event.selfDeaf && !event.serverDeaf;

}

module.exports = {
    isSatisfiedBy
}