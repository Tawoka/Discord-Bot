"use strict";

const apiClient = moduleLoader.client.databaseRestAPI();
const logger = moduleLoader.utils.logger();

async function loadUserFromDiscord(userId){
    const guild = await client.guilds.fetch(process.env.serverId);
    return guild.members.cache.get(userId);
}

function trackUser(userId) {
    if (!userList.includes(userId)){
        logger.info("New user registered");
        loadUserFromDiscord(userId).then(user => {
            apiClient.registerNewUser(user).then(() => userList.push(userId)).catch(error => logger.error(error));
        });
    }
}

function UserTracker(){

    return {
        trackUser
    }

}

module.exports = UserTracker();