const { SlashCommandBuilder } = require('discord.js');
const { enqueue } = require('../musicManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Reproduce música o la agrega a la cola')
    .addStringOption(option =>
      option
        .setName('query')
        .setDescription('Nombre o URL de YouTube')
        .setRequired(true),
    ),

  async execute(interaction) {
    const query = interaction.options.getString('query', true);

    await interaction.deferReply();

    try {
      const result = await enqueue(interaction, query);

      if (result.type === 'NOT_FOUND') {
        await interaction.editReply('❌ No encontré resultados para esa búsqueda.');
        return;
      }

      if (result.type === 'PLAYING') {
        await interaction.editReply(`🎶 Reproduciendo ahora: **${result.track.title}**`);
        return;
      }

      await interaction.editReply(`➕ Agregada a la cola: **${result.track.title}**`);
    } catch (error) {
      if (error.message === 'NO_VOICE_CHANNEL') {
        await interaction.editReply('❌ Debes estar en un canal de voz para usar `/play`.');
        return;
      }

      throw error;
    }
  },
};
