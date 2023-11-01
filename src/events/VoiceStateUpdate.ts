import {BotEvent} from "../@types/discord";
import {Events} from "discord.js";
import {Logger} from "../utils/Logger";
import {UserActivityTracking} from "../features/usertracking/UserActivityTracking";

const event: BotEvent = {
    name: Events.VoiceStateUpdate,
    once: false,
    async execute(oldMember, newMember) {
        Logger.info("Voice event received");
        const statistics = new UserActivityTracking();
        await statistics.registerVoiceUpdate(oldMember, newMember);
    }
}

export default event;