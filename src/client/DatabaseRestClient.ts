import axios from "axios";
import {GuildBasedChannel, GuildMember} from "discord.js";
import {Utils} from "../utils/Utils";

export class DatabaseRestClient {

    public async sendUserStats(data: object){
        const POST_URL = "/store/stats/user";
        return axios.post(Utils.buildSemperAPIUrlWithServerId(POST_URL), data);
    }

    public async getAllKnownUsers(){
        const GET_URL = "/user";
        return axios.get(Utils.buildSemperAPIUrlWithServerId(GET_URL));
    }

    public async registerNewUser(user: GuildMember){
        const POST_URL = "/user";
        const data = {
            id: user.user.id,
            name: user.user.username,
            displayName: user.nickname
        };
        return axios.post(Utils.buildSemperAPIUrlWithServerId(POST_URL), data);
    }

    public async getAllKnownChannels(){
        const GET_URL = "/channel";
        return axios.get(Utils.buildSemperAPIUrlWithServerId(GET_URL));
    }

    public async registerNewChannel(channel: GuildBasedChannel) {
        const POST_URL = "/channel";
        const data = {
            discordChannelId: channel.id,
            discordChannelName: channel.name,
            discordChannelParentId: channel.parentId
        }
        return axios.post(Utils.buildSemperAPIUrlWithServerId(POST_URL), data);
    }

}