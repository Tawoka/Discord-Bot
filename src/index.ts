import {Client, Collection, GatewayIntentBits} from "discord.js";
import {config} from "dotenv";
import {ScriptLoader} from "./utils/ScriptLoader";
import {SlashCommand} from "./@types/discord";
import {LoadServerData} from "./bootstrap/LoadServerData";
import {Discord} from "./cache/Discord";
import axios from "axios";

config({path: __dirname + '/.env'});
axios.defaults.headers.common[`${process.env.API_TOKEN_HEADER}`] = process.env.API_ACCESS_TOKEN;

const token = process.env.token;

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates]
});

client.commands = new Collection<string, SlashCommand>();
Discord.client = client;

const scriptLoader = new ScriptLoader();

const commandList = scriptLoader.loadCommands(__dirname);
for (const commandObject of commandList) {
    client.commands.set(commandObject.command.name, commandObject);
}

const eventList = scriptLoader.loadEvents(__dirname);
for (const eventObject of eventList){
    if (eventObject.once) {
        client.once(eventObject.name, (...args) => eventObject.execute(...args));
    } else {
        client.on(eventObject.name, (...args) => eventObject.execute(...args));
    }
}

client.login(token).then();

LoadServerData.loadUsers();
LoadServerData.loadChannels();