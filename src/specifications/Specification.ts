import {BotEvent, SlashCommand} from "../@types/discord";

export interface Specification {

    isSatisfiedBy(args: BotEvent | SlashCommand): boolean,

    get name(): string

}