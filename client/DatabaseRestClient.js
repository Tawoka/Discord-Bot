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
    const GET_URL = "/user";
    return axios.get(utils.buildSemperAPIUrl(GET_URL));
}

const DatabaseRestClient = function () {

    axios.defaults.headers.common[process.env.API_TOKEN_HEADER] = process.env.API_ACCESS_TOKEN;

    return {
        sendUserStats,
        sendChannelData,
        getAllKnownUsers
    }

}

module.exports = DatabaseRestClient();