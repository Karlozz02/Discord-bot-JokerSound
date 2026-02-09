const { SlashCommandBuilder } = require('discord.js');
const { stop } = require('../musicManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Detiene la música y limpia la cola'),

  async execute(interaction) {
    const stopped = stop(interaction.guild.id);

    if (!stopped) {
      await interaction.reply('❌ No estoy reproduciendo música ahora mismo.');
      return;
    }

    await interaction.reply('⏹️ Reproducción detenida y cola limpiada.');
  },
};
