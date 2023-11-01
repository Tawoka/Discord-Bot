import {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    Collection,
    Message, PermissionResolvable,
    SlashCommandBuilder
} from "discord.js";

declare module "discord.js" {
    export interface Client {
        commands: Collection<string, any>;
    }
}

export interface SlashCommand {
    command: SlashCommandBuilder,
    execute: (interaction : ChatInputCommandInteraction) => void,
    autocomplete?: (interaction: AutocompleteInteraction) => void,
    cooldown?: number // in seconds
}

export interface Command {
    name: string,
    execute: (message: Message, args: Array<string>) => void,
    permissions: Array<PermissionResolvable>,
    aliases: Array<string>,
    cooldown?: number,
}

interface GuildOptions {
    prefix: string,
}

export type GuildOption = keyof GuildOptions

export interface BotEvent {
    name: string,
    once?: boolean | false,
    execute: (...args: any[]) => void
}
