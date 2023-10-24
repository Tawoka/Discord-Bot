import {Message} from "discord.js";
import { MessageSpamSpecification } from "./specification/MessageSpamSpecification";
import {MessageActivity, MessageActivityMap} from "../../@types/types";

export class MessageTracker {

    private activityMap: MessageActivityMap = {};

    public handleMessageEvent(messageEvent: Message) {
        const userId = messageEvent.author.id;
        this.handleNewUser(userId);
        if (!this.spamDetected(messageEvent, userId)){
            this.registerValidMessage(messageEvent);
        }
    }

    private registerValidMessage(messageEvent: Message) {
        const userId = messageEvent.author.id;
        const activity = this.activityMap[userId];
        const channels = activity.channels;
        const channelId = messageEvent.channelId;

        if (channels[channelId] != null) {
            channels[channelId]++;
        } else {
            channels[channelId] = 1;
        }
        activity.state.lastMessageTimestamp = messageEvent.createdTimestamp;
    }

    private spamDetected(messageEvent: Message, userId: string){
        const messageTimestamp = messageEvent.createdTimestamp;
        const lastMessageTimestamp = this.activityMap[userId].state.lastMessageTimestamp;
        const spamSpecification = new MessageSpamSpecification(lastMessageTimestamp);
        return spamSpecification.isSatisfiedBy(messageTimestamp);
    }

    private initializeActivity(): MessageActivity{
        return {
            state: {
                lastMessageTimestamp: Date.now()
            },
            channels: {}
        }
    }

    private handleNewUser(userId: string) {
        if (this.activityMap[userId] == null) {
            this.activityMap[userId] = this.initializeActivity();
        }
    }

    public getData(){
        return this.activityMap;
    }

    public resetCounters(){
        const activities: MessageActivity[] = Object.values(this.activityMap);
        for (let activity of activities){
            activity.channels = {};
        }
    }

}

