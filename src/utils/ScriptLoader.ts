import path from "path";
import fs from "fs";
import {Specification} from "../specifications/Specification";
import {EventSpecification} from "../specifications/EventSpecification";
import {CommandObject, EventObject} from "../specifications/SpecificationObjects";

export class ScriptLoader {

    public loadCommands(baseDir: string): CommandObject[] {
        // const commandsPath = path.join(baseDir, 'commands');
        // const commandFiles = fs.readdirSync(commandsPath);
        // return loadScriptsFromFolder(commandFiles, commandsPath, commandSpecification);
        return [];
    }

    public loadEvents(baseDir: string): EventObject[] {
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
                objects.concat(this.loadScriptsFromFolder(subFolderFiles, filePath, specification));
            } else if (filePath.endsWith(".js")) {
                const object = this.loadFile(filePath, specification);
                if (object) {
                    objects.push(object);
                }
            }
        }
        return objects;
    }

    private loadFile(filePath: string, specification: Specification) {
        const command = require(filePath);
        if (specification.isSatisfiedBy(command)) {
            return command;
        } else {
            console.log(`[WARNING] The script at ${filePath} is not satisfying the ${specification.name}.`);
        }
    }

}