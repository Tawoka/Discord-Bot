"use strict";

module.exports = {

    /**
     * Checks if the provided argument is empty. This function is used to avoid using null pointers.
     *
     * Currently checks for empty Objects, Arrays and Strings.
     *
     * @param argument - checked argument
     * @return {boolean} true if argument is empty
     */
    isEmpty: function (argument){
        if (Array.isArray(argument) && argument.length === 0){
            return true;
        }
        if (typeof argument === "object" && Object.keys(argument).length === 0){
            return true;
        }
        return argument === "";
    },

    removeEntry: function (index, array){
        if (typeof index != "number" || index < 0 || index >= array.length){
            return;
        }
        return array.slice(0, index).concat(array.slice(index + 1, array.length));
    },

    merge: function (array1, array2){
        return [... new Set([...array1, ...array2])];
    },

    buildSemperAPIUrl(path) {
        return  process.env.API_URL + path + "?accessToken=$" + process.env.API_ACCESS_TOKEN;
    }

}