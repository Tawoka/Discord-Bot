import path from "path";
import fs from "fs";
import {Specification} from "../specifications/Specification";
import {EventSpecification} from "../specifications/EventSpecification";
import {CommandSpecification} from "../specifications/CommandSpecification";
import {BotEvent, SlashCommand} from "../@types/discord";

export class ScriptLoader {

    public loadCommands(baseDir: string): SlashCommand[] {
        const commandsPath = path.join(baseDir, 'commands');
        const commandFiles = fs.readdirSync(commandsPath);
        return this.loadScriptsFromFolder(commandFiles, commandsPath, new CommandSpecification());
    }

    public loadEvents(baseDir: string): BotEvent[] {
        const eventPath = path.join(baseDir, 'events');
        const eventFiles = fs.readdirSync(eventPath);
        return this.loadScriptsFromFolder(eventFiles, eventPath, new EventSpecification());
    }

    private loadScriptsFromFolder(files: string[], scriptPath: string, specification: Specification): any[] {
        const objects = [];
        for (const file of files) {
            const filePath = path.join(scriptPath, file);
            if (fs.existsSync(filePath) && fs.lstatSync(filePath).isDirectory()) {
                const subFolderFiles = fs.readdirSync(filePath);
                const scriptsFromSubFolder = this.loadScriptsFromFolder(subFolderFiles, filePath, specification);
                objects.concat(scriptsFromSubFolder);
            } else if (filePath.endsWith(".js")) {
                const object = this.loadFile(filePath, specification);
                if (object) {
                    objects.push(object);
                }
            }
        }
        return objects;
    }

    private loadFile(filePath: string, specification: Specification): any {
        const command = require(filePath).default;
        if (specification.isSatisfiedBy(command)) {
            return command;
        } else {
            console.log(`[WARNING] The script at ${filePath} is not satisfying the ${specification.name}.`);
            return null;
        }
    }

}