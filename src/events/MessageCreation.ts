import {BotEvent} from "../@types/discord";
import {Events} from "discord.js";
import {UserActivityTracking} from "../features/usertracking/UserActivityTracking";
import {Logger} from "../utils/Logger";

const event: BotEvent = {
    name: Events.MessageCreate,
    once: false,
    async execute(message) {
        Logger.info("Message event received");
        const statistics = new UserActivityTracking();
        await statistics.registerMessage(message);
    }
}

export default event;