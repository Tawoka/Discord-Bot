import {Specification} from "./Specification";
import {BotEvent} from "../@types/discord";

export class EventSpecification implements Specification {

    isSatisfiedBy(event: BotEvent): boolean {
        return this.hasName(event) && this.hasOnceProperty(event);
    }

    get name(): string {
        return "EventSpecification";
    }

    private hasName(event: BotEvent): boolean{
        return event != null && event.name != null && event.name !== "";
    }

    private hasOnceProperty(event: BotEvent): boolean {
        return event != null && event.hasOwnProperty("once");
    }

}