"use strict";

const BASE_PATH = "./../";

/**
 * One weakness of NodeJS, compared to languages like Java or C#, is the lack of proper import support. Their require()
 * is slick for their own modules, but becomes cumbersome, when we use our own modules. The need to have relative paths
 * from the file we require in, tempts us to use shallow packaging, leading to less structured projects.
 *
 * To combat this, the ModuleLoader takes over that task. Anything requiring another module can leverage this loader,
 * to grab said module, without worrying about relative paths.
 */
module.exports = {

    features: {
        modulePath: BASE_PATH + "features/",
        userActivityTracking: function () {
            return require(this.modulePath + "usertracking/UserActivityTracking");
        },
        coinToss: function () {
            return require(this.modulePath + "headsandtails/CoinTossController");
        }
    },
    specifications: {
        modulePath: BASE_PATH + "specifications/",
        command: function () {
            return require(this.modulePath + "CommandSpecification");
        },
        event: function () {
            return require(this.modulePath + "EventSpecification");
        }
    },
    client: {
        modulePath: BASE_PATH + "client/",
        databaseRestAPI: function () {
            return require(this.modulePath + "DatabaseRestClient");
        }
    },
    utils: {
        modulePath: BASE_PATH + "utils/",
        textLoader: function () {
            return require(this.modulePath + "TextLoader");
        },
        utils: function () {
            return require(this.modulePath + "Utils");
        },
        logger: function () {
            return require(this.modulePath + "Logger");
        },
        security: function () {
            return require(this.modulePath + "Security");
        }
    },
    model: {
        modulePath: BASE_PATH + "model/",
        userActivity: function (){
            return require(this.modulePath + "UserActivity");
        }
    }

}