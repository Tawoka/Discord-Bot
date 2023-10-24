import {VoiceState} from "discord.js";
import {Logger} from "../../utils/Logger";
import {UserNotMutedSpecification} from "./specification/UserNotMutedSpecification";
import {Discord} from "../../cache/Discord";
import {VoiceActivity, VoiceActivityMap} from "../../@types/types";

export class VoiceTracker {

    private activityMap: VoiceActivityMap = {};

    public handleVoiceEvent(oldMember: VoiceState, newMember: VoiceState): void {

        this.handleNewEntry(oldMember);
        if (this.userMuted(oldMember, newMember)){
            this.registerUserMute(newMember);
        } else if (this.userRemovedMute(oldMember, newMember)){
            this.registerUserUnmute(newMember);
        } else if (this.userEnteredVoice(oldMember, newMember)){
            this.registerVoiceEnter(newMember);
        } else if (this.userLeftVoice(oldMember, newMember)){
            this.registerVoiceLeave(oldMember);
        } else if (this.userSwitchedChannel(oldMember, newMember)){
            this.registerChannelSwitch(oldMember, newMember);
        }
    }

    private registerChannelSwitch(oldMember: VoiceState, newMember: VoiceState) {
        this.registerVoiceLeave(oldMember);
        this.registerVoiceEnter(newMember);
        Logger.info("Voice channel switched");
    }

    private enteredDifferentChannel(newMember: VoiceState, oldMember: VoiceState) {
        return newMember.channelId !== oldMember.channelId;
    }

    private userSwitchedChannel(oldMember: VoiceState, newMember: VoiceState){
        return this.didJoinChannel(newMember)
            && this.wasInChannel(oldMember)
            && this.enteredDifferentChannel(newMember, oldMember);
    }

    private userEnteredVoice(oldMember: VoiceState, newMember: VoiceState){
        return this.didJoinChannel(newMember) && !this.wasInChannel(oldMember);
    }

    private registerVoiceLeave(oldMember: VoiceState) {
        const userActivity = this.activityMap[oldMember.id];
        const currentVoiceChannel = userActivity.state.currentVoiceChannel;

        if (currentVoiceChannel == null) {
            return;
        }

        const timestamp = Date.now();
        const channels = userActivity.channels;
        const lastVoiceUpdate = userActivity.state.lastVoiceUpdate;

        if (channels[currentVoiceChannel] != null) {
            channels[currentVoiceChannel] += timestamp - lastVoiceUpdate;
        } else {
            channels[currentVoiceChannel] = timestamp - lastVoiceUpdate;
        }
        userActivity.state.lastVoiceUpdate = timestamp;
        userActivity.state.currentVoiceChannel = "";

        Logger.info("Voice left");
    }

    private registerUserMute(newMember: VoiceState) {
        let userActivity = this.activityMap[newMember.id];
        if (userActivity.state.currentVoiceChannel != null){
            this.registerVoiceLeave(newMember);
        }
        Logger.info("User muted");
    }

    private registerVoiceEnter(newMember: VoiceState) {
        if (newMember.channelId != null) {
            let userActivity = this.activityMap[newMember.id];
            userActivity.state.lastVoiceUpdate = Date.now();
            userActivity.state.currentVoiceChannel = newMember.channelId;
            Logger.info("Voice entered");
        }
    }

    private registerUserUnmute(newMember: VoiceState) {
        this.registerVoiceEnter(newMember);
        Logger.info("User no longer muted");
    }

    private didJoinChannel(newMember: VoiceState) {
        return newMember.channelId != null;
    }

    private userLeftVoice(oldMember: VoiceState, newMember: VoiceState){
        return this.wasInChannel(oldMember) && !this.didJoinChannel(newMember);
    }

    private userRemovedMute(oldMember: VoiceState, newMember: VoiceState){
        const userIsNotMutedSpecification = new UserNotMutedSpecification();
        return userIsNotMutedSpecification.isSatisfiedBy(newMember) && !userIsNotMutedSpecification.isSatisfiedBy(oldMember);
    }

    private userMuted(oldMember: VoiceState, newMember: VoiceState){
        const userIsNotMutedSpecification = new UserNotMutedSpecification();
        return userIsNotMutedSpecification.isSatisfiedBy(oldMember) && !userIsNotMutedSpecification.isSatisfiedBy(newMember);
    }

    private wasInChannel(oldMember: VoiceState) {
        return oldMember.channelId != null;
    }

    private handleNewEntry(oldMember: VoiceState) {
        const userId = oldMember.id;
        if (this.activityMap[userId] == null) {
            this.activityMap[userId] = this.initializeActivity();
            this.handleVoiceActivityOnBotStart(oldMember);
        }
    }

    private handleVoiceActivityOnBotStart(oldMember: VoiceState) {
        const userIsNotMutedSpecification = new UserNotMutedSpecification();
        if (this.wasInChannel(oldMember) && userIsNotMutedSpecification.isSatisfiedBy(oldMember)) {
            this.activityMap[oldMember.id].state.lastVoiceUpdate = Discord.startupTime;
        }
    }

    private initializeActivity(): VoiceActivity{
        return {
            state: {
                lastVoiceUpdate: Date.now(),
                currentVoiceChannel: ""
            },
            channels: {}
        }
    }

    public getData(){
        return this.activityMap;
    }

    public resetCounters(){
        const activities = Object.values(this.activityMap);
        for (let activity of activities){
            activity.channels = {};
            if (activity.state.currentVoiceChannel != null){
                activity.state.lastVoiceUpdate = Date.now();
            }
        }
    }

}
