"use strict";

function isSatisfiedBy(event){

    let user = event.client.users.cache.get(event.id);
    return !user.bot;

}

module.exports = {
    isSatisfiedBy
}