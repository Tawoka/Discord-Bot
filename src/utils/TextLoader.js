"use strict";

const fs = require("fs");

const ENGLISH = JSON.parse(fs.readFileSync(`${__dirname}/../i18n/enUS.json`));
const GERMAN = JSON.parse(fs.readFileSync(`${__dirname}/../i18n/deDE.json`));

function TextLoader() {
    return {
        english: ENGLISH,
        german: GERMAN
    }
}

module.exports = TextLoader();