import {Message} from "discord.js";
import { MessageSpamSpecification } from "./specification/MessageSpamSpecification";
import {MessageActivity, MessageActivityMap} from "../../@types/types";

export class MessageTracker {

    public static readonly EMPTY_MESSAGE_ACTIVITY: MessageActivity = MessageTracker.initializeActivity();

    private static activityMap: MessageActivityMap = {};

    public handleMessageEvent(messageEvent: Message) {
        const userId = messageEvent.author.id;
        this.handleNewUser(userId);
        if (!this.spamDetected(messageEvent, userId)){
            this.registerValidMessage(messageEvent);
        }
    }

    private registerValidMessage(messageEvent: Message) {
        const userId = messageEvent.author.id;
        const activity = MessageTracker.activityMap[userId];
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
        const lastMessageTimestamp = MessageTracker.activityMap[userId].state.lastMessageTimestamp;
        const spamSpecification = new MessageSpamSpecification(lastMessageTimestamp);
        return spamSpecification.isSatisfiedBy(messageTimestamp);
    }

    private static initializeActivity(): MessageActivity{
        return {
            state: {
                lastMessageTimestamp: 0
            },
            channels: {}
        }
    }

    private handleNewUser(userId: string) {
        if (MessageTracker.activityMap[userId] == null) {
            MessageTracker.activityMap[userId] = MessageTracker.initializeActivity();
        }
    }

    public getData(){
        return MessageTracker.activityMap;
    }

    public resetCounters(){
        const activities: MessageActivity[] = Object.values(MessageTracker.activityMap);
        for (let activity of activities){
            activity.channels = {};
        }
    }

}

