import {CommandObject, EventObject} from "./SpecificationObjects";

export interface Specification {

    isSatisfiedBy(args: EventObject | CommandObject): boolean,

    get name(): string

}