import {ChannelType} from "discord-api-types/v10";
import {TextChannel} from "discord.js";
import {Discord} from "../cache/Discord";
import {Environment} from "../cache/Environment";

const logLevel: number = process.env.SEMPER_RED_LOG_LEVEL != null ? +process.env.SEMPER_RED_LOG_LEVEL : 1;

export class Logger {

    public static error(message: string): void {
        Logger.log(message);
    }

    public static debug(message: string) {
        if (logLevel >= 4) {
            Logger.log(message);
        }
    }

    public static warning(message: string) {
        if (logLevel >= 2) {
            Logger.log(message);
        }
    }

    public static info(message: string) {
        if (logLevel >= 3) {
            Logger.log(message);
        }
    }

    public static trace(message: string) {
        if (logLevel >= 5) {
            Logger.log(message);
        }
    }

    private static log (message: string) {
        if (Environment.SEMPER_RED_LOG_TOOL === "bot"){
            Logger.bot(message);
        } else {
            console.log(message);
        }
    }

    public static bot(message: string) {
        if (process.env.LOG_CHANNEL != null) {
            Discord.client.channels.fetch(process.env.LOG_CHANNEL).then(channel => {
                if (channel != null && channel.type == ChannelType.GuildText) {
                    const textChannel = channel as TextChannel;
                    textChannel.send(message).then();
                }
            });
        }
    }

}