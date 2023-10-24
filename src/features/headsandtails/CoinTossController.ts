import {ColorResolvable, EmbedBuilder} from "discord.js";
import {TextLoader} from "../../utils/TextLoader";

const textLoader = new TextLoader();
const english = textLoader.english.coin.output;
const german = textLoader.german.coin.output;

const GOLD_TYPE = "gold";
const GOLD_COLOR = "Gold";
const GOLD_HEADS_IMAGE = "https://g.smpr-com.de/heads_gold.png"
const GOLD_TAILS_IMAGE = "https://g.smpr-com.de/tails_gold.png"
const SILVER_TYPE = "silver";
const SILVER_COLOR = 0xC0C0C0;
const SILVER_HEADS_IMAGE = "https://g.smpr-com.de/heads_silver.png";
const SILVER_TAILS_IMAGE = "https://g.smpr-com.de/tails_silver.png";
const TAILS = "tails";
const HEADS = "heads";

export class CoinTossController {

    public toss(coinType: string | null, locale: string): EmbedBuilder{
        const randomSide = Math.random() * 2;
        const tails = Math.floor(randomSide) === 0;
        if (coinType == null){
            const randomType = Math.floor(Math.random() * 2);
            coinType = randomType === 1 ? GOLD_TYPE : SILVER_TYPE;
        }

        if (coinType === GOLD_TYPE){
            if (tails){
                return this.createEmbed(GOLD_TAILS_IMAGE, GOLD_COLOR,TAILS, locale);
            } else {
                return this.createEmbed(GOLD_HEADS_IMAGE, GOLD_COLOR,HEADS, locale);
            }
        } else {
            if (tails){
                return this.createEmbed(SILVER_TAILS_IMAGE, SILVER_COLOR, TAILS, locale);
            } else {
                return this.createEmbed(SILVER_HEADS_IMAGE, SILVER_COLOR, HEADS, locale);
            }
        }
    }

    private createEmbed(imageLink: string, color: ColorResolvable, side: string, locale: string): EmbedBuilder{
        let text: string;
        if (side === TAILS){
            text = locale === "de" ? german.tails : english.tails;
        } else {
            text = locale === "de" ? german.heads : english.heads;
        }
        return new EmbedBuilder()
            .setDescription(text)
            .setColor(color)
            .setThumbnail(imageLink)
            ;
    }

}