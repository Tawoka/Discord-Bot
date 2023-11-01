import {REST, Routes} from "discord.js";
import {config} from "dotenv";
import {ScriptLoader} from "./utils/ScriptLoader";

if (process.env.token == null || process.env.clientId == null || process.env.serverId == null) {
    console.error("FATAL: .env file lacks required information for command deployment!");
} else {
    config();
    const {token, clientId, serverId} = process.env;

    const scriptLoader = new ScriptLoader();

    const commandObjects = scriptLoader.loadCommands(__dirname);
    const commands = [];
    for (const command of commandObjects) {
        commands.push(command.command.toJSON());
    }

    // Construct and prepare an instance of the REST module
    const rest = new REST().setToken(token);

    (async () => {
        try {
            console.log(`Started refreshing ${commands.length} application (/) commands.`);

            // The put method is used to fully refresh all commands in the server with the current set
            await rest.put(Routes.applicationGuildCommands(clientId, serverId), {body: commands});
            console.log(`Successfully reloaded application (/) commands.`);
        } catch (error) {
            // And of course, make sure you catch and log any errors!
            console.error(error);
        }
    })();

}