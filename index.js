require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));

  if (!command?.data || !command?.execute) {
    console.warn(`⚠️ El archivo ${file} no tiene 'data' o 'execute'.`);
    continue;
  }

  client.commands.set(command.data.name, command);
}

client.once('clientReady', async readyClient => {
  try {
    const commandsData = [...client.commands.values()].map(command => command.data.toJSON());
    await readyClient.application.commands.set(commandsData);
    console.log(`✅ Slash commands sincronizados (${commandsData.length})`);
  } catch (error) {
    console.error('❌ Error registrando slash commands:', error);
  }

  console.log(`${readyClient.user.tag} listo para reproducir música 🎶`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) {
    await interaction.reply({ content: '❌ Comando no encontrado.', ephemeral: true });
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);

    const message = { content: '❌ Error ejecutando el comando.', ephemeral: true };
    if (interaction.deferred || interaction.replied) {
      await interaction.followUp(message);
    } else {
      await interaction.reply(message);
    }
  }
});

client.login(process.env.TOKEN);
