import {BotEvent} from "../@types/discord";
import {Events} from "discord.js";

const event: BotEvent = {
    name: Events.VoiceStateUpdate,
    once: false,
    async execute(oldMember, newMember) {
        // logger.info("Voice event received");
        // await statistics.registerVoiceUpdate(oldMember, newMember);
    }
}

export default event;