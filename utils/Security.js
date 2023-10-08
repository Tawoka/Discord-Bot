"use strict";

function isConnectedServer(guildId){
    return guildId === process.env.serverId;
}

function SecurityUtils() {

    return {
        isConnectedServer
    }

}

module.exports = SecurityUtils();