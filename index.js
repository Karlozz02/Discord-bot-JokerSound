require("dotenv").config();
const {Client, GatewayIntentBits} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ],
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  try {
    const command = require(`./commands/${interaction.commandName}.js`);
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    interaction.reply("❌ Error ejecutando el comando");
  }
});

client.on("clientReady", () => {
  console.log(`${client.user.tag} Listo para reproducir notas🎶`);
});

client.login(process.env.TOKEN);