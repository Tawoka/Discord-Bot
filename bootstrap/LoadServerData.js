"use strict";

const client = moduleLoader.client.databaseRestAPI();
const utils = moduleLoader.utils.utils();
const logger = moduleLoader.utils.logger();

function loadUsers(){
    client.getAllKnownUsers().then(result => {
        if (utils.isEmpty(result.data)){
            global.userList = [];
        } else {
            global.userList = result.data;
        }
    }).catch(error => {
        logger.error(error);
    });
}

function LoadServerData(){
    return {
        loadUsers
    }
}

module.exports = LoadServerData();