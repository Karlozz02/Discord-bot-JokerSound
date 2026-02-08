const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
  name: 'stop',
  async execute(interaction) {
    const connection = getVoiceConnection(interaction.guild.id);

    if (!connection) {
      return interaction.reply('❌ No estoy reproduciendo nada');
    }

    connection.destroy();
    interaction.reply('⏹️ Música detenida');
  }
};
