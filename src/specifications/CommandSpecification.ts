import {SlashCommand} from "../@types/discord";
import {Specification} from "../@types/interfaces";

export class CommandSpecification implements Specification {
    public isSatisfiedBy(command: SlashCommand): boolean {
        return this.doesCommandHaveData(command)
            && this.doesCommandHaveValidName(command)
            && this.doesCommandHaveAnExecuteFunction(command)
            ;
    }

    private doesCommandHaveData(command: SlashCommand): boolean{
        return command != null && command.command != null;
    }

    private doesCommandHaveValidName(command: SlashCommand): boolean{
        return this.doesCommandHaveData(command)
            && command.command.name != null && command.command.name !== "";
    }

    private doesCommandHaveAnExecuteFunction(command: SlashCommand): boolean{
        return command != null &&
            command.execute != null && typeof command.execute === "function";
    }

    get name(): string {
        return "CommandSpecification";
    }

}