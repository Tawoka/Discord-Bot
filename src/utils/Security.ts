export class Security {

    public static isConnectedServer(guildId: string){
        return guildId === process.env.serverId;
    }

}