"use strict";

const axios = require("axios");
const utils = moduleLoader.utils.utils();

async function sendUserStats(data){
    const POST_URL = "/store/stats/user";
    return axios.post(utils.buildSemperAPIUrlWithServerId(POST_URL), data);
}

async function getAllKnownUsers(){
    const GET_URL = "/user";
    return axios.get(utils.buildSemperAPIUrlWithServerId(GET_URL));
}

async function registerNewUser(user){
    const POST_URL = "/user";
    const data = {
        id: user.user.id,
        name: user.user.username,
        displayName: user.nickname
    };
    return axios.post(utils.buildSemperAPIUrlWithServerId(POST_URL), data);
}

async function getAllKnownChannels(){
    const GET_URL = "/channel";
    return axios.get(utils.buildSemperAPIUrlWithServerId(GET_URL));
}

async function registerNewChannel(channel) {
    const POST_URL = "/channel";
    const data = {
        discordChannelId: channel.id,
        discordChannelName: channel.name,
        discordChannelParentId: channel.parentId
    }
    return axios.post(utils.buildSemperAPIUrlWithServerId(POST_URL), data);
}

const DatabaseRestClient = function () {

    axios.defaults.headers.common[process.env.API_TOKEN_HEADER] = process.env.API_ACCESS_TOKEN;

    return {
        sendUserStats,
        getAllKnownUsers,
        registerNewUser,
        getAllKnownChannels,
        registerNewChannel
    }

}

module.exports = DatabaseRestClient();