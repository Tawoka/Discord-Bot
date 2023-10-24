import {Specification} from "../../../@types/interfaces";

const THREE_SECONDS = 3000;

export class MessageSpamSpecification implements Specification {

    private readonly lastTimeStamp: number;

    constructor(lastTimeStamp: number) {
        this.lastTimeStamp = lastTimeStamp;
    }


    isSatisfiedBy(messageTimestamp: number): boolean {
        return messageTimestamp - this.lastTimeStamp < THREE_SECONDS;
    }

    get name(): string {
        return "MessageSpamSpecification";
    }



}