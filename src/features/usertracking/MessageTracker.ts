import {Message} from "discord.js";
import { MessageSpamSpecification } from "./specification/MessageSpamSpecification";

export class MessageTracker {

    private activityMap: ActivityMap = {};

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

    private initializeActivity(): Activity{
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
        const activities: Activity[] = Object.values(this.activityMap);
        for (let activity of activities){
            activity.channels = {};
        }
    }

}

type Activity = {
    state: {
        lastMessageTimestamp: number
    },
    channels: ChannelMap
}

type ChannelMap = {
    [key: string]: number
}

type ActivityMap = {
    [key: string]: Activity
}