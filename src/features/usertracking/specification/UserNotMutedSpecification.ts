import {Specification} from "../../../@types/interfaces";
import {VoiceState} from "discord.js";

export class UserNotMutedSpecification implements Specification {

    isSatisfiedBy(event: VoiceState): boolean {
        return !event.selfDeaf && !event.serverDeaf;
    }

    get name(): string {
        return "UserNotMutedSpecification";
    }

}