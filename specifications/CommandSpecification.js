"use strict";

/**
 * Verifies the structure of the command object. Command is only valid when
 * - command is an object with an attribute called data
 * - command data contains a not empty string attribute called name
 * - command has a function called execute
 *
 * @param command - verified object
 * @return {boolean} true, if the specification is satisfied
 */
function isSatisfiedBy(command){
    return doesCommandHaveData(command)
        && doesCommandHaveValidName(command)
        && doesCommandHaveAnExecuteFunction(command)
        ;
}

function doesCommandHaveData(command){
    return command && command.data;
}

function doesCommandHaveValidName(command){
    return command && command.data && command.data.name && command.data.name !== "";
}

function doesCommandHaveAnExecuteFunction(command){
    return command && command.execute && typeof command.execute === "function";
}

function CommandSpecification(){

    return {
        name: "CommandSpecification",
        isSatisfiedBy
    }

}

module.exports = CommandSpecification();