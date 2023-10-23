import {Client} from "discord.js";

declare module globalThis {
    var client: Client;
    function getStartupTime(): number;
}