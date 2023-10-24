import {globalThis} from "../@types/global";
import client = globalThis.client;
import {ChannelType} from "discord-api-types/v10";
import {TextChannel} from "discord.js";

const logLevel: number = process.env.logLevel != null ? +process.env.logLevel : 1;

export class Logger {

    public static error(message: string): void {
        console.log(message);
    }

    public static debug(message: string) {
        if (logLevel >= 4) {
            console.log(message);
        }
    }

    public static warning(message: string) {
        if (logLevel >= 2) {
            console.log(message);
        }
    }

    public static info(message: string) {
        if (logLevel >= 3) {
            console.log(message);
        }
    }

    public static trace(message: string) {
        if (logLevel >= 5) {
            console.log(message);
        }
    }

    public static bot(message: string) {
        if (process.env.LOG_CHANNEL != null) {
            client.channels.fetch(process.env.LOG_CHANNEL).then(channel => {
                if (channel != null && channel.type == ChannelType.GuildText) {
                    const textChannel = channel as TextChannel;
                    textChannel.send(message).then();
                }
            });
        }
    }

}