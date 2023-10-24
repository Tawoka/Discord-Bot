import {Message, VoiceState} from "discord.js";
import {Security} from "../../utils/Security";
import {MessageEventSpecification} from "./specification/MessageEventSpecification";
import {UserTracker} from "./UserTracker";
import {Logger} from "../../utils/Logger";
import {ChannelTracker} from "./ChannelTracker";
import {ActivityCompiler} from "./ActivityCompiler";
import {VoiceTracker} from "./VoiceTracker";
import {MessageTracker} from "./MessageTracker";
import {VoiceEventSpecification} from "./specification/VoiceEventSpecification";

export class UserActivityTracking {

    private readonly messageSpecification = new MessageEventSpecification();
    private readonly voiceSpecification = new VoiceEventSpecification();

    private readonly userTracker = new UserTracker();
    private readonly channelTracker = new ChannelTracker();
    private readonly messageTracker = new MessageTracker();
    private readonly voiceTracker = new VoiceTracker();
    private readonly activityCompiler = new ActivityCompiler();

    private statisticsAreTransmitted = false;
    private messageEvents: Message[] = [];
    private voiceEvents: any[] = [];
    private hourOfLastCall: number = 0;

    public async registerMessage(messageEvent: Message) {
        if (this.statisticsAreTransmitted) {
            this.messageEvents.push(messageEvent);
            return;
        }

        if (!this.isNewHour()) {
            this.handleMessageEvent(messageEvent);
        } else {
            this.messageEvents.push(messageEvent);
            await this.handleAPICall();
        }
    }

    private clearCache() {
        this.messageTracker.resetCounters();
        this.voiceTracker.resetCounters();
        Logger.info("clearing cache");
    }

    private async sendStatistics() {
        const success = await this.activityCompiler.compile();
        if (success) {
            this.clearCache();
        }
    }

    private async performUploadProcess() {
        this.statisticsAreTransmitted = true;
        await this.sendStatistics();
        this.statisticsAreTransmitted = false;
    }

    private updateHourOfLastCall() {
        this.hourOfLastCall = new Date().getHours();
    }

    private async handleAPICall() {
        await this.performUploadProcess();
        await this.executeCachedEvents();
        this.updateHourOfLastCall();
    }

    private async executeCachedEvents() {
        this.messageEvents.forEach(this.registerMessage);
        this.messageEvents = [];
        this.voiceEvents.forEach(entry => this.registerVoiceUpdate(entry[0], entry[1]));
        this.voiceEvents = [];
    }

    private isNewHour() {
        let currentHour = new Date().getMinutes();
        return this.hourOfLastCall !== currentHour;
    }

    private handleMessageEvent(messageEvent: Message) {
        if (!this.messageSpecification.isSatisfiedBy(messageEvent)) {
            return;
        }
        if (messageEvent.guildId == null || !Security.isConnectedServer(messageEvent.guildId)) {
            Logger.info("Received message originates from another server");
            return;
        }
        this.userTracker.trackUser(messageEvent.author.id);
        this.channelTracker.trackChannel(messageEvent.channelId);
        this.messageTracker.handleMessageEvent(messageEvent);
        Logger.info("Message received");
    }

    private handleVoiceEvent(oldMember: VoiceState, newMember: VoiceState) {
        if (!this.voiceSpecification.isSatisfiedBy(oldMember) || !this.voiceSpecification.isSatisfiedBy(newMember)) {
            Logger.debug("Skipping voice event, since specification has not been satisfied");
            return;
        }
        if (!Security.isConnectedServer(newMember.guild.id)) {
            Logger.info("Received voice event originates from another server");
            return;
        }
        this.userTracker.trackUser(newMember.id);
        if (newMember.channelId != null){
            this.channelTracker.trackChannel(newMember.channelId);
        }
        this.voiceTracker.handleVoiceEvent(oldMember, newMember);
    }

    public async registerVoiceUpdate(oldMember: VoiceState, newMember: VoiceState) {
        if (this.statisticsAreTransmitted) {
            this.voiceEvents.push([oldMember, newMember]);
            return;
        }

        if (!this.isNewHour()) {
            this.handleVoiceEvent(oldMember, newMember);
        } else {
            this.voiceEvents.push([oldMember, newMember]);
            await this.handleAPICall();
        }
    }

}
