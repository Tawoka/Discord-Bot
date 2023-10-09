"use strict";
require("dotenv").config();

const { Client, GatewayIntentBits, Collection } = require("discord.js");
const token = process.env.token;

const moduleLoader = require("./utils/ModuleLoader");
global.moduleLoader = moduleLoader;

const scriptLoader = require("./utils/ScriptLoader");
const statsFeature = moduleLoader.features.userActivityTracking();

const dataBootstrap = require("./bootstrap/LoadServerData")

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

statsFeature.init();
