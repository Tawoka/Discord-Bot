"use strict";

/**
 * Verifies the structure of the event object. Event is only valid when
 * - event is an object with a not empty string attribute called name
 * - event has an boolean attribute called once - omitting this attribute for an implicit false is invalid
 *
 * @param event - verified object
 * @return {boolean} true, if the specification is satisfied
 */
function isSatisfiedBy(event){
    return hasName(event) && hasOnceProperty(event);
}

function hasName(event){
    return event && event.name && event.name !== "";
}

function hasOnceProperty(event){
    return event && event.hasOwnProperty("once");
}

function EventSpecification(){

    return {
        name: "EventSpecification",
        isSatisfiedBy
    }

}

module.exports = EventSpecification();