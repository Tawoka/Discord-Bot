export type MessageActivity = {
    state: {
        lastMessageTimestamp: number
    },
    channels: ChannelMap
}

export type ChannelMap = {
    [key: string]: number
}

export type MessageActivityMap = {
    [key: string]: MessageActivity
}

export type VoiceActivity = {
    state: {
        lastVoiceUpdate: number,
        currentVoiceChannel: string
    },
    channels: ChannelMap
}

export type VoiceActivityMap = {
    [key: string]: VoiceActivity
}

export type UserActivity = {
    userDiscordId: string,
    discordChannelId: string,
    messageCount: number,
    voiceActivity: number
}