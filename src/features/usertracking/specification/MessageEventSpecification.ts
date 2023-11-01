import {Specification} from "../../../@types/interfaces";
import {Message} from "discord.js";
import {Utils} from "../../../utils/Utils";

export class MessageEventSpecification implements Specification {
    isSatisfiedBy(message: Message): boolean {
        if (!this.checkMandatoryFieldsAreSet(message)){
            return false;
        }
        return message.interaction == null;
    }

    private checkMandatoryFieldsAreSet(message: Message){
        if (!this.fieldIsSet(message.channelId)){
            return false;
        }
        if (message.guildId == null || !this.fieldIsSet(message.guildId)){
            return false;
        }
        if (!this.fieldIsSet(message.id)){
            return false;
        }
        if (message.author == null || message.author && !this.fieldIsSet(message.author.id)){
            return false;
        }
        return !message.author.bot;
    }

    private fieldIsSet(field: string){
        return field != null && !Utils.stringIsEmpty(field);
    }

    get name(): string {
        return "MessageEventSpecification";
    }

}