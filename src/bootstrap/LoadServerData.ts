import {DatabaseRestClient} from "../client/DatabaseRestClient";
import {Utils} from "../utils/Utils";
import {Users} from "../cache/Users";
import {Channels} from "../cache/Channels";
import {Logger} from "../utils/Logger";

const client = new DatabaseRestClient();

export class LoadServerData {

    public static loadUsers(){
        client.getAllKnownUsers().then(result => {
            Users.initialize();
            if (!Utils.arrayIsEmpty(result.data)){
                Users.idList = result.data;
            }
        }).catch(error => Logger.error(error));
    }

    public static loadChannels(){
        client.getAllKnownChannels().then(result => {
            Channels.initialize();
            if (!Utils.arrayIsEmpty(result.data)){
                Channels.idList = result.data;
            } else {
                //old API
                Channels.idList = result.data.channelData;
            }
        }).catch(error => Logger.error(error));
    }

}