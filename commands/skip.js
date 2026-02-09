const { SlashCommandBuilder } = require('discord.js');
const { skip } = require('../musicManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Salta la canción actual'),

  async execute(interaction) {
    const skipped = skip(interaction.guild.id);

    if (!skipped) {
      await interaction.reply('❌ No hay ninguna canción sonando para saltar.');
      return;
    }

    await interaction.reply('⏭️ Canción saltada.');
  },
};
