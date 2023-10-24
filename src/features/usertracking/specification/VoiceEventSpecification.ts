import {Specification} from "../../../@types/interfaces";
import {VoiceState} from "discord.js";

export class VoiceEventSpecification implements Specification {
    isSatisfiedBy(event: VoiceState): boolean {
        const user = event.client.users.cache.get(event.id);
        return user != null && !user.bot;
    }

    get name(): string {
        return "VoiceEventSpecification";
    }

}