const {
  AudioPlayerStatus,
  NoSubscriberBehavior,
  VoiceConnectionStatus,
  createAudioPlayer,
  createAudioResource,
  entersState,
  getVoiceConnection,
  joinVoiceChannel,
} = require('@discordjs/voice');
const play = require('play-dl');

const guildStates = new Map();

function getGuildState(guildId) {
  if (!guildStates.has(guildId)) {
    const player = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Pause,
      },
    });

    guildStates.set(guildId, {
      player,
      queue: [],
      playing: false,
      connection: null,
    });
  }

  return guildStates.get(guildId);
}

async function resolveTrack(query) {
  let url = query;
  let title = query;

  if (!play.yt_validate(query)) {
    const results = await play.search(query, { limit: 1 });
    if (!results.length) return null;

    url = results[0].url;
    title = results[0].title ?? url;
  }

  return { url, title };
}

async function connectToChannel(interaction, state) {
  const channel = interaction.member.voice.channel;

  if (!channel) {
    throw new Error('NO_VOICE_CHANNEL');
  }

  const existingConnection = getVoiceConnection(interaction.guild.id);
  state.connection = existingConnection ?? joinVoiceChannel({
    channelId: channel.id,
    guildId: interaction.guild.id,
    adapterCreator: interaction.guild.voiceAdapterCreator,
  });

  state.connection.subscribe(state.player);

  await entersState(state.connection, VoiceConnectionStatus.Ready, 20_000);
}

async function playNext(interaction, state) {
  const nextTrack = state.queue.shift();

  if (!nextTrack) {
    state.playing = false;
    return;
  }

  state.playing = true;

  const stream = await play.stream(nextTrack.url);
  const resource = createAudioResource(stream.stream, { inputType: stream.type });

  state.player.removeAllListeners(AudioPlayerStatus.Idle);
  state.player.once(AudioPlayerStatus.Idle, () => {
    playNext(interaction, state).catch(console.error);
  });

  state.player.play(resource);

  return nextTrack;
}

async function enqueue(interaction, query) {
  const state = getGuildState(interaction.guild.id);

  await connectToChannel(interaction, state);

  const track = await resolveTrack(query);
  if (!track) return { type: 'NOT_FOUND' };

  state.queue.push(track);

  if (!state.playing) {
    const nowPlaying = await playNext(interaction, state);
    return { type: 'PLAYING', track: nowPlaying };
  }

  return { type: 'QUEUED', track };
}

function skip(guildId) {
  const state = guildStates.get(guildId);

  if (!state || (!state.playing && state.queue.length === 0)) {
    return false;
  }

  state.player.stop();
  return true;
}

function stop(guildId) {
  const state = guildStates.get(guildId);
  const connection = getVoiceConnection(guildId);

  if (!state && !connection) return false;

  if (state) {
    state.queue = [];
    state.playing = false;
    state.player.stop(true);
    guildStates.delete(guildId);
  }

  if (connection) {
    connection.destroy();
  }

  return true;
}

module.exports = {
  enqueue,
  skip,
  stop,
};
