import {DatabaseRestClient} from "../../client/DatabaseRestClient";
import {VoiceTracker} from "./VoiceTracker";
import {MessageTracker} from "./MessageTracker";
import {
    ChannelMap,
    MessageActivity,
    MessageActivityMap,
    UserActivity,
    VoiceActivity,
    VoiceActivityMap
} from "../../@types/types";
import {Utils} from "../../utils/Utils";
import {Logger} from "../../utils/Logger";
import {AxiosResponse} from "axios";
import {SemperStandardResponse} from "../../@types/API";

export class ActivityCompiler {

    private readonly THIRTY_MINUTES = 30 * 60 * 1000;
    private readonly NAME_OF_FUTURE = "retrySendingStats";

    private attemptRetry: boolean = false;

    private readonly databaseClient = new DatabaseRestClient();
    private readonly voiceTracker = new VoiceTracker();
    private readonly messageTracker = new MessageTracker();

    public async compile() {
        const stats = this.createStatistics();
        try {
            this.attemptRetry = true;
            const response = await this.databaseClient.sendUserStats(stats);
            return this.handleResponse(response, stats);
        } catch (error) {
            this.callFailed(error, stats);
            return false;
        }
    }

    private callSuccessful(response: AxiosResponse<SemperStandardResponse, any>) {
        return response.data.statusId === 1;
    }

    private countTotalMessages(stats: UserActivity[]) {
        let count = 0;
        for (let entry of stats) {
            count += entry.messageCount;
        }
        return count;
    }

    private countTotalTimeInVoice(stats: UserActivity[]) {
        let count = 0;
        for (let entry of stats) {
            count += entry.voiceActivity;
        }
        return count;
    }

    private createDiscordNotification(stats: UserActivity[]) {
        Logger.bot(`Tracking data has been sent. A total of ${this.countTotalMessages(stats)} messages, and a total of ${this.countTotalTimeInVoice(stats)} voice seconds have been recorded.`);
    }

    private handleResponse(response: AxiosResponse, stats: UserActivity[]) {
        if (this.callSuccessful(response)) {
            Logger.debug(JSON.stringify(response));
            this.createDiscordNotification(stats);
            return true;
        } else {
            this.callFailed(response, stats);
            return false;
        }
    }

    private addTimeSinceLastUpdateToVoiceCounter(activity: VoiceActivity, currentChannel: string) {
        activity.channels[currentChannel] += Date.now() - activity.state.lastVoiceUpdate;
    }

    private handleOngoingVoiceActivity(voiceData: VoiceActivityMap) {
        for (let activity of Object.values(voiceData)) {
            let currentChannel = activity.state.currentVoiceChannel;
            if (currentChannel != null) {
                this.addTimeSinceLastUpdateToVoiceCounter(activity, currentChannel);
            }
        }
    }

    private buildUserList(messageData: MessageActivityMap, voiceData: VoiceActivityMap) {
        return Utils.merge(Object.keys(messageData), Object.keys(voiceData));
    }

    private buildChannelList(messageChannels: ChannelMap, voiceChannels: ChannelMap) {
        return Utils.merge(Object.keys(messageChannels), Object.keys(voiceChannels));
    }

    private voiceAndMessageDataFound(voiceEntry: VoiceActivity, channelId: string, messageEntry: MessageActivity) {
        return voiceEntry.channels[channelId] != null && messageEntry.channels[channelId] != null;
    }

    private createFullEntry(userId: string, channelId: string, messageCount: number, voiceCount: number): UserActivity {
        return {
            userDiscordId: userId,
            discordChannelId: channelId,
            messageCount: messageCount,
            voiceActivity: voiceCount
        };
    }

    private parseTimeIntoSeconds(time: number) {
        if (!time) {
            return 0;
        }
        return time / 1000;
    }

    private messageDataFound(messageEntry: MessageActivity, channelId: string) {
        return messageEntry.channels[channelId] != null;
    }

    private createMessageEntry(userId: string, channelId: string, messageCount: number) {
        return this.createFullEntry(userId, channelId, messageCount, 0);
    }

    private voiceDataFound(voiceEntry: VoiceActivity, channelId: string) {
        return voiceEntry.channels[channelId] != null;
    }

    private createVoiceEntry(userId: string, channelId: string, voiceCount: number) {
        return this.createFullEntry(userId, channelId, 0, voiceCount);
    }

    private buildDataObject(channelList: string[], voiceEntry: VoiceActivity, messageEntry: MessageActivity, userId: string) {
        let data = [];
        for (let channelId of channelList) {
            if (this.voiceAndMessageDataFound(voiceEntry, channelId, messageEntry)) {
                const entry =
                    this.createFullEntry(userId, channelId, messageEntry.channels[channelId],
                        this.parseTimeIntoSeconds(voiceEntry.channels[channelId]));
                data.push(entry);
            } else if (this.messageDataFound(messageEntry, channelId)) {
                const entry =
                    this.createMessageEntry(userId, channelId, messageEntry.channels[channelId]);
                data.push(entry);
            } else if (this.voiceDataFound(voiceEntry, channelId)) {
                const entry =
                    this.createVoiceEntry(userId, channelId, this.parseTimeIntoSeconds(voiceEntry.channels[channelId]));
                data.push(entry);
            }
        }
        return data;
    }

    private mergeDataForUser(userId: string, messageData: MessageActivityMap, voiceData: VoiceActivityMap) {
        const messageEntry = messageData[userId];
        const voiceEntry = voiceData[userId];
        const channelList = this.buildChannelList(messageEntry.channels, voiceEntry.channels);
        return this.buildDataObject(channelList, voiceEntry, messageEntry, userId);
    }

    private buildStatisticObject(userList: string[], messageData: MessageActivityMap, voiceData: VoiceActivityMap) {
        const data: UserActivity[] = [];
        for (let userId of userList) {
            let userData = this.mergeDataForUser(userId, messageData, voiceData);
            data.concat(userData);
        }
        return data;
    }


    private buildUserStatisticObject(messageData: MessageActivityMap, voiceData: VoiceActivityMap) {
        const userList = this.buildUserList(messageData, voiceData);
        return this.buildStatisticObject(userList, messageData, voiceData);
    }

    private createStatistics() {
        const voiceData = this.voiceTracker.getData();
        this.handleOngoingVoiceActivity(voiceData);
        const messageData = this.messageTracker.getData();
        return this.buildUserStatisticObject(messageData, voiceData);
    }

    private callFailed(error: any, data: UserActivity[]) {
        Logger.error(error);
        Logger.bot(`Sending tracking data failed`);
        if (this.attemptRetry) {
            this.attemptRetry = false;
            this.resend(data);
        }
    }

    private resend(data: UserActivity[]) {
        Logger.bot(`Attempting another call in 30 minutes`);
        setTimeout(() => {
            this.databaseClient.sendUserStats(data)
                .then((response: AxiosResponse) => {
                    if (response.data.statusId === 1) {
                        Logger.bot(`Attempt to resend data successful`);
                    } else {
                        Logger.bot(`Failed to send statistics twice. Data could not be sent`);
                    }
                })
                .catch(() => {
                    Logger.bot(`Failed to send statistics twice. Data could not be sent`);
                });
        }, this.THIRTY_MINUTES, this.NAME_OF_FUTURE);
    }

}