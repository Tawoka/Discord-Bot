import "./utils/ModuleLoader";
import {Client, Collection, GatewayIntentBits} from "discord.js";
import * as dotenv from "dotenv";
import {ScriptLoader} from "./utils/ScriptLoader";
import {CommandObject, EventObject} from "./specifications/SpecificationObjects";

dotenv.config();

const token = process.env.token;

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates]
});

// @ts-ignore
this.client = client;

const scriptLoader = new ScriptLoader();
const eventList = scriptLoader.loadEvents(__dirname);
for (const eventObject of eventList){
    if (eventObject.once) {
        client.once(eventObject.name, (...args) => eventObject.execute(...args));
    } else {
        client.on(eventObject.name, (...args) => eventObject.execute(...args));
    }
}

/*

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
