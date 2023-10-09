"use strict";

const axios = require("axios");
const logger = moduleLoader.utils.logger();
const utils = moduleLoader.utils.utils();

async function sendUserStats(data){
    const POST_URL = "/store/stats/user/" + process.env.serverId;
    return axios.post(utils.buildSemperAPIUrl(POST_URL), data);
}

async function sendChannelData(data){
    const POST_URL = "/channel/store/" + process.env.serverId;
    /*[
    {
        "discordChannelId": "1",
        "discordChannelParentId": "123456789",
        "discordChannelName": "Voice Test"
    }
]*/
}

async function getAllKnownUsers(){
    const GET_URL = "/user" + process.env.serverId;
    return axios.get(utils.buildSemperAPIUrl(GET_URL));
}

const DatabaseRestClient = function () {

    return {
        sendUserStats,
        sendChannelData,
        getAllKnownUsers
    }

}

module.exports = DatabaseRestClient();