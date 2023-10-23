import {CommandInteraction, SlashCommandBuilder} from "discord.js";

export type EventObject = {

    once: boolean;

    name: string;

    execute(...args: any[]): Promise<void>;

}

export type CommandObject = {

    data: SlashCommandBuilder;

    execute(interaction: CommandInteraction): Promise<void>;

}