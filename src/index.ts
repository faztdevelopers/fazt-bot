import { config } from 'dotenv';
import { Client, TextChannel, MessageEmbed } from 'discord.js';
import Commands from './commands';
import { connect } from './database';
import { getByName as settingName } from './utils/settings';

// Load .env file
config();

// Initialize the bot
export const prefix: string = process.env.PREFIX || '!';
export const bot: Client = new Client();

// On channel message
bot.on('message', async (message) => {
  if (!message.guild || message.author.bot) {
    return;
  }

  if (!message.content.startsWith(prefix)) {
    return;
  }

  const msg: string = message.content.slice(prefix.length);
  if (Commands.length) {
    for await (let command of Commands) {
      if (command.format.test(msg.toLowerCase())) {
        await command.execute(message, msg.match(command.format)?.groups || {})
      }
    }
  }
});

// On new member
bot.on('guildMemberAdd', async (member) => {
  if (!member.user) {
    return;
  }

  const welcomesID: string = (await settingName('welcomes_channel'))?.value || '';
  const welcomesChannel = bot.channels.cache.get(welcomesID);

  const offTopicID: string = (await settingName('off_topic_channel'))?.value || '';
  const offTopicChannel = bot.channels.cache.get(offTopicID);

  if (!welcomesChannel || welcomesChannel.type !== 'text' || !offTopicChannel) {
    return;
  }

  const colors: string[] = ['#f44336', '#e91e63', '#9c27b0', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#795548', '#9e9e9e'];
  const rand: number = Math.floor(Math.random() * (colors.length - 1));

  await (welcomesChannel as TextChannel).send(
    new MessageEmbed()
      .setTitle('Bienvenid@ a Fazt Tech')
      .setThumbnail(member.user.displayAvatarURL())
      .setColor(colors[rand])
      .setDescription(
        `${member.user} (${member.user.username}), siéntete libre de hacer preguntas y conocer a otros desarrolladores con tus mismos intereses. Empieza en ${offTopicChannel}.`
      )
      .setTimestamp(Date.now())
  );
});

// On ready event
bot.on('ready', async () => {
  console.log(`Bot logged as ${bot.user?.username}`);
  bot.user?.setActivity(`${prefix}help`);
});

// Initialize
(async () => {
  // Connect to the database
  await connect();

  // Bot login
  await bot.login(process.env.TOKEN || '');
})();
