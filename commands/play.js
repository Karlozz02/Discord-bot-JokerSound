const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const play = require('play-dl');

module.exports = {
  name: 'play',
  async execute(interaction) {
    const query = interaction.options.getString('query');
    const channel = interaction.member.voice.channel;

    if (!channel) {
      return interaction.reply('❌ Debes estar en un canal de voz');
    }

    await interaction.deferReply();

    let url = query;

    // Si NO es URL, buscar en YouTube
    if (!play.yt_validate(query)) {
      const results = await play.search(query, { limit: 1 });
      if (!results.length) {
        return interaction.editReply('❌ No encontré resultados');
      }
      url = results[0].url;
    }

    const stream = await play.stream(url);
    const resource = createAudioResource(stream.stream, {
      inputType: stream.type
    });

    const player = createAudioPlayer();
    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: interaction.guild.id,
      adapterCreator: interaction.guild.voiceAdapterCreator
    });

    connection.subscribe(player);
    player.play(resource);

    interaction.editReply(`🎶 Reproduciendo: **${url}**`);
  }
};
