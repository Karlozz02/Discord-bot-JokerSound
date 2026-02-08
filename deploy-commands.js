require('dotenv').config();
const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const commands = [
  new SlashCommandBuilder()
    .setName('play')
    .setDescription('Reproduce música')
    .addStringOption(option =>
      option.setName('query')
        .setDescription('Nombre o link de la canción')
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Detiene la música'),

  new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Salta la canción actual'),
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    console.log('✅ Comandos registrados');
  } catch (error) {
    console.error(error);
  }
})();
