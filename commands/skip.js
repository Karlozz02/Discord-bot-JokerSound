const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
  name: 'skip',
  async execute(interaction) {
    const connection = getVoiceConnection(interaction.guild.id);

    if (!connection) {
      return interaction.reply('❌ No hay canción para saltar');
    }

    connection.destroy();
    interaction.reply('⏭️ Canción saltada');
  }
};
