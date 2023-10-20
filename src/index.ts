import "./utils/ModuleLoader";
import {Client, GatewayIntentBits} from "discord.js";
import {ModuleLoader} from "./utils/ModuleLoader";

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates]
});
console.log(client);
ModuleLoader.getModule("userActivityTracking");
// global.moduleLoader = moduleLoader;

/*
import * as moduleLoader from "./utils/ModuleLoader";

import {Client, Collection, GatewayIntentBits} from "discord.js";

import * as scriptLoader from "./utils/ScriptLoader";

import * as dataBootstrap from "./bootstrap/LoadServerData";

import * as dotenv from "dotenv";
dotenv.config();


const token = process.env.token;
global.moduleLoader = moduleLoader;
const statsFeature = moduleLoader.features.userActivityTracking();
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates]
});

global.client = client;

client.commands = new Collection();

//Load all available commands
const commandList = scriptLoader.loadCommands(__dirname);
for (const commandObject of commandList){
    client.commands.set(commandObject.data.name, commandObject);
}

//Load all available events
const eventList = scriptLoader.loadEvents(__dirname);
for (const eventObject of eventList){
    if (eventObject.once) {
        client.once(eventObject.name, (...args) => eventObject.execute(...args));
    } else {
        client.on(eventObject.name, (...args) => eventObject.execute(...args));
    }
}

client.login(token);

dataBootstrap.loadUsers();
dataBootstrap.loadChannels();

statsFeature.init();
*/
