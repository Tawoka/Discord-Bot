"use strict";

require("dotenv").config();

const { REST, Routes } = require('discord.js');
const { token, clientId, serverId } = process.env;

const scriptLoader = require("./utils/ScriptLoader");

const commandObjects = scriptLoader.loadCommands(__dirname);
const commands = [];
for (const command of commandObjects){
    commands.push(command.data.toJSON());
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        // The put method is used to fully refresh all commands in the server with the current set
        const data = await rest.put(
            Routes.applicationGuildCommands(clientId, serverId),
            { body: commands },
        );

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        // And of course, make sure you catch and log any errors!
        console.error(error);
    }
})();
