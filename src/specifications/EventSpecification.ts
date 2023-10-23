import {Specification} from "./Specification";
import {EventObject} from "./SpecificationObjects";

export class EventSpecification implements Specification {

    isSatisfiedBy(event: EventObject): boolean {
        return this.hasName(event) && this.hasOnceProperty(event);
    }

    get name(): string {
        return "EventSpecification";
    }

    private hasName(event: EventObject): boolean{
        return event != null && event.name != null && event.name !== "";
    }

    private hasOnceProperty(event: EventObject): boolean {
        return event != null && event.hasOwnProperty("once");
    }

}