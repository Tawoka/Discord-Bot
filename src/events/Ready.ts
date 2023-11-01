import {BotEvent} from "../@types/discord";
import {Events} from "discord.js";

const event: BotEvent = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);
    },
}

export default event;