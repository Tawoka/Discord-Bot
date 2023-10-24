import {Users} from "../../cache/Users";
import {Logger} from "../../utils/Logger";
import {Discord} from "../../cache/Discord";
import {Environment} from "../../cache/Environment";
import {DatabaseRestClient} from "../../client/DatabaseRestClient";

const apiClient = new DatabaseRestClient();
export class UserTracker {

    public trackUser(userId: string) {
        if (!Users.idList.includes(userId)){
            Logger.info("New user registered");
            this.loadUserFromDiscord(userId).then(user => {
                if (user != null) {
                    apiClient.registerNewUser(user)
                        .then(() => Users.idList.push(userId))
                        .catch((error: any) => Logger.error(error));
                }
            });
        }
    }

    private async loadUserFromDiscord(userId: string){
        const guild = await Discord.client.guilds.fetch(Environment.serverId);
        return guild.members.cache.get(userId);
    }

}