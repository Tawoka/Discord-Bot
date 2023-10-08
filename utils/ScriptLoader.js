"use strict";

const fs = require("fs");
const path = require("path");

const commandSpecification = moduleLoader.specifications.command();
const eventSpecification = moduleLoader.specifications.event();

/**
 * Loads all valid commands from the command folder. This method allows the files to be at any depth, as long as they're
 * stored in .js-files, and the CommandsSpecification is satisfied.
 *
 * @see {commandSpecification}
 *
 * @param baseDir - baseDirectory of the project
 * @returns {*[]} array filled with all the discovered command objects
 */
function loadCommands(baseDir) {
    const commandsPath = path.join(baseDir, 'commands');
    const commandFiles = fs.readdirSync(commandsPath);
    return loadScriptsFromFolder(commandFiles, commandsPath, commandSpecification);
}

/**
 * We do not know, nor care, how many folders we store in the directory. We care about maintainability only.
 * To ensure our tool finds all the files, we loop over all files, recursively call folders, and load all .js-files.
 *
 * @param files - list of files or folders, where scripts can be stored
 * @param scriptPath - path to the current folder
 * @param specification - the specification every script has to satisfy
 * @returns array of objects
 */
function loadScriptsFromFolder(files, scriptPath, specification) {
    const objects = [];
    for (const file of files) {
        const filePath = path.join(scriptPath, file);
        if (fs.existsSync(filePath) && fs.lstatSync(filePath).isDirectory()) {
            const subFolderFiles = fs.readdirSync(filePath);
            objects.concat(loadScriptsFromFolder(subFolderFiles, filePath, specification));
        } else if (filePath.endsWith(".js")) {
            const object = loadFile(filePath, specification);
            if (object) {
                objects.push(object);
            }
        }
    }
    return objects;
}

/**
 * We load the file, verify its mandatory structure, and then return it.
 *
 * @param filePath - local path to the file we load
 * @param specification - the particular specification that has to be satisfied
 */
function loadFile(filePath, specification) {
    const command = require(filePath);
    if (specification.isSatisfiedBy(command)) {
        return command;
    } else {
        console.log(`[WARNING] The script at ${filePath} is not satisfying the ${specification.name}.`);
    }
}

/**
 * Loads all valid events from the event folder. This method allows the files to be at any depth, as long as they're
 * stored in .js-files, and the event specification is satisfied.
 *
 * @see {eventSpecification}
 *
 * @param baseDir - baseDirectory of the project
 * @returns {*[]} array filled with all the discovered command objects
 */
function loadEvents(baseDir) {
    const eventPath = path.join(baseDir, 'events');
    const eventFiles = fs.readdirSync(eventPath);
    return loadScriptsFromFolder(eventFiles, eventPath, eventSpecification);
}

function ScriptLoader() {

    return {
        loadCommands,
        loadEvents
    }

}

module.exports = ScriptLoader();