import {Channels} from "../../cache/Channels";
import {Logger} from "../../utils/Logger";
import {Discord} from "../../cache/Discord";
import {Environment} from "../../cache/Environment";
import {DatabaseRestClient} from "../../client/DatabaseRestClient";

const apiClient = new DatabaseRestClient();

export class ChannelTracker {

    public trackChannel(channelId: string) {
        if (!Channels.idList.includes(channelId)) {
            Logger.info("New channel registered");
            this.loadChannelFromDiscord(channelId).then(channel => {
                    if (channel != null) {
                        apiClient.registerNewChannel(channel)
                            .then(() => Channels.idList.push(channelId))
                            .catch((error: any) => Logger.error(error))
                    }
                }
            );
        }
    }

    private async loadChannelFromDiscord(channelId: string) {
        const guild = await Discord.client.guilds.fetch(Environment.serverId);
        return guild.channels.cache.get(channelId);
    }


}