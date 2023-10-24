import {Specification} from "../../../@types/interfaces";

export class MessageChannelSpecification implements Specification{
    isSatisfiedBy(args: any): boolean {
        return true;
    }

    get name(): string {
        return "MessageChannelSpecification";
    }


}