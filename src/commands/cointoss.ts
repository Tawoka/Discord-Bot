import {
    ChatInputCommandInteraction,
    SlashCommandBuilder
} from "discord.js";
import {TextLoader} from "../utils/TextLoader";
import {CoinTossController} from "../features/headsandtails/CoinTossController";
import {SlashCommand} from "../@types/discord";

const textLoader = new TextLoader();
const english = textLoader.english.coin.command;
const german = textLoader.german.coin.command;

const controller = new CoinTossController();

const slashCommand: SlashCommand = {
    command: new SlashCommandBuilder()
        .addStringOption(option =>
            option
                .setName(english.option.name)
                .setNameLocalizations({
                    de: german.option.name
                })
                .setDescription(english.option.description)
                .setDescriptionLocalizations({
                    de: german.option.description
                })
                .setRequired(false)
                .addChoices(
                    {
                        name: english.option.choices[0],
                        name_localizations: {
                            de: german.option.choices[0]
                        },
                        value: english.option.choices[0]
                    },
                    {
                        name: english.option.choices[1],
                        name_localizations: {
                            de: german.option.choices[1]
                        },
                        value: english.option.choices[1]
                    }
                )
        )
        .setName(english.name)
        .setNameLocalizations({
            de: german.name
        })
        .setDescription(english.description)
        .setDescriptionLocalizations({
            de: german.description
        })
    ,
    async execute(interaction: ChatInputCommandInteraction) {
        const coinType = interaction.options.getString(english.option.name);
        const result = controller.toss(coinType, interaction.locale);
        await interaction.reply({embeds: [result]});
    }
}

export default slashCommand;