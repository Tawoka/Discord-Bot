"use strict";

const client = moduleLoader.client.databaseRestAPI();

function loadUsers(){
    client.getAllKnownUsers().then(result => console.log(result.data));
}

function LoadServerData(){
    return {
        loadUsers
    }
}

module.exports = LoadServerData();