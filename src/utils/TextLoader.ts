/*function buildTypeSafetyArray(translation: object, prefix: string){
    let translationArray: string[] = [];
    for (const [key, value] of Object.entries(translation)){
        const translationKey = prefix == "" ? key : `${prefix}.${key}`;
        translationArray.push(translationKey);
        if (typeof value == "object"){
            buildTypeSafetyArray(value, translationKey);
        }
    }
    return translationArray;
}

function defineTranslationType(translation: object): string{
    const keys: string[] = buildTypeSafetyArray(translation, "");
    // const definitionString: string = keys.join(" | ");
    // type translationPath = `home`;
    return keys.join(" | ");
}

const translationObject = import("../i18n/enUS.json");
type translationPath = defineTranslationType(translationObject);*/

import {I18n} from "../@types/i18n";
import german from "../i18n/deDE.json";
import english from "../i18n/enUS.json";

export class TextLoader {

    get german(): I18n {
        return german;
    }

    get english(): I18n{
        return english;
    }

}