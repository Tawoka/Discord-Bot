import {BotEvent} from "../@types/discord";
import {Events} from "discord.js";

const event: BotEvent = {
    name: Events.MessageCreate,
    once: false,
    async execute(message) {
        // logger.info("Message event received");
        // await statistics.registerMessage(message);
    }
}

export default event;