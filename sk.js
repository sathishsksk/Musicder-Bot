const { Telegraf, Markup } = require('telegraf');
const request = require('request');

const settings = require('./settings');

const bot = new Telegraf(settings.bot_api_key);

bot.start((ctx) => {
  ctx.reply(settings.start_message, { parse_mode: "HTML" });
});

bot.command('about', (ctx) => {
  ctx.reply(settings.about_message, { parse_mode: "HTML" });
});

bot.command('help', (ctx) => {
  ctx.reply(settings.help_message, { parse_mode: "HTML" });
});

bot.on('message', async (ctx) => {
  const recmsg = ctx.message.text;
  const recfname = ctx.message.chat.first_name;

  if (recmsg === undefined) {
    ctx.reply("Sorry, you are sending file. Send song's name or Jiosaavn's link to get results.");
    return;
  }

  if (recmsg.includes('https://www.jiosaavn.com/')) {
    const options = {
      'method': 'GET',
      'url': `${settings.jiosaavn_api_url}link?query=${recmsg}`,
    };

    try {
      const response = await request(options);

      if (response.body.includes(`{"result": "false"}`)) {
        ctx.reply("Sorry this jiosaavn song link is invalid.\nMake sure you are sending jiosaavn song link neither album or playlist link.\nIf this problem persists send a message at @t_projects.");
        return;
      }

      const data = JSON.parse(response.body);
      const songname = data.song;
      console.log(`Serving ${songname} to ${recfname}`);
      const album = data.album;
      const artist = data.primary_artists;
      const id = data.id;
      const dldlink = `${settings.musicder_url}download/?id=${id}`;
      const caption = `🎵 ${songname}\n\n🎨 Artist : ${artist}\n🎶 Album : ${album}`;

      ctx.replyWithHTML('<b><i>Sending you Appropriate Result 🎶</i></b>');
      ctx.replyWithPhoto(
        { url: data.image },
        { caption: caption },
        Markup.inlineKeyboard([
          Markup.urlButton('Download ' + songname, dldlink),
        ]).extra(),
      );

    } catch (error) {
      ctx.reply("Sorry something went wrong make sure you are sending jiosaavn song link neither album or playlist link.\nIf this problem persists send a message at @t_projects.");
    }
  } else {
    const formattedmsg = recmsg.replace(/ /gi, '+');
    const options = {
      'method': 'GET',
      'url': `${settings.jiosaavn_api_url}search?query=${formattedmsg}`,
    };

    try {
      const response = await request(options);

      const data = JSON.parse(response.body);

      const tempone = data[0];
      const temptwo = data[1];
      const tempthree = data[2];
      const tempfour = data[3];
      const tempfive = data[4];

      if (tempone === undefined) {
        ctx.reply('Sorry, Nothing Found');
        return;
      }

      const songnameone = data[0].title;
      console.log(`Serving ${songnameone} to ${recfname}`);
      const albumone = data[0].album;
      const artistone = data[0].more_info.singers;
      const id_one = data[0].id;
      const dldlinkone = `${settings.musicder_url}download/?id=${id_one}`;
      const captionone = `🎵
