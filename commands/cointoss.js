"use strict";

const {SlashCommandBuilder} = require("discord.js");

const controller = moduleLoader.features.coinToss();
const textLoader = moduleLoader.utils.textLoader();

const english = textLoader.english.coin.command;
const german = textLoader.german.coin.command;

module.exports = {
    data: new SlashCommandBuilder()
        .setName(english.name)
        .setNameLocalizations({
            de: german.name
        })
        .setDescription(english.description)
        .setDescriptionLocalizations({
            de: german.description
        })
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
    ,
    async execute(interaction) {
        const coinType = interaction.options.getString(english.option.name);
        const result = controller.toss(coinType, interaction.locale);
        interaction.reply({embeds: [result]});
    },
};