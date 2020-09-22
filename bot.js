const Discord = require('discord.js');
const ytdl = require('ytdl-core-discord');
const client = new Discord.Client();

var userCooldowns = {};
var queue = [];

client.on('ready',() => {
    console.log('Online');
    setInterval(function(){ for (userx in userCooldowns){if(userCooldowns[userx] > 0){userCooldowns[userx]-= 1;} }; }, 3000);
})

client.on('message', message => {
  if(message.content === '!test'){
    message.channel.send('✓');
  }

  if(message.content === '!quack'){
    message.delete(3000);
    if(message.member.voiceChannel && (userCooldowns[message.member.author] == undefined || userCooldowns[message.member.author] == 0)){
      
      userCooldowns[message.member.author] = 10;
      let channel = message.member.voiceChannel;
      console.log(userCooldowns[message.member.author]);
      channel.join()
      .then(connection => {
        const dispatcher = connection.playFile('./sounds/mac-quack.mp3', {});
        message.channel.send(':duck:').then(d_msg => { d_msg.delete(3000); });
        dispatcher.on('end', () =>  {
          message.member.voiceChannel.leave();
        })
      })
      .catch(console.log);
    }
    else{
      if (message.member.voiceChannel && (userCooldowns[message.member.username] != undefined || userCooldowns[message.member.username] > 0)){
          message.reply('Cooldown remaining: ' + userCooldowns[message.member.author]).then(d_msg => { d_msg.delete(3000); });;
      }
      else{
          message.reply('You need to join a channel first!').then(d_msg => { d_msg.delete(3000); });
      }
    }
  }

  if(message.content === '!badquack'){
    message.delete(3000);
    if(message.member.voiceChannel && (userCooldowns[message.member.author] == undefined || userCooldowns[message.member.author] == 0)){
      userCooldowns[message.member.author] = 10;
      message.member.voiceChannel.join()
      .then(connection => {
        const dispatcher = connection.playFile('./sounds/birding.mp3', {});
        message.reply('Use !quack instead, idiot').then(d_msg => { d_msg.delete(5000); });
        dispatcher.on('end', () =>  {
          message.member.voiceChannel.leave()
        })
      })
      .catch(console.log);
    }
    else{
      if (message.member.voiceChannel && (userCooldowns[message.member.username] != undefined || userCooldowns[message.member.username] > 0)){
          message.reply('Cooldown remaining: ' + userCooldowns[message.member.author]).then(d_msg => { d_msg.delete(3000); });;
      }
      else{
          message.reply('You need to join a channel first!').then(d_msg => { d_msg.delete(3000); });;
      }
    }
  }

  if(message.content.includes('!jukebox')){
    var url = message.content.split('!jukebox')[1];

    message.member.voiceChannel.join()
      .then(connection => {
        let videoInfo = await ytdl.getInfo(url);
        let video = {
          title: videoInfo.title,
          url: videoInfo.video_url, 
        };
        message.channel.send(`Now playing: ${video.title}`);
        play(connection, url);
      })
      .catch(error => {
        console.log(error)
      })
  }
});

async function play(connection, url) {
  connection.playOpusStream(await ytdl(url));
}

client.login(process.env.token);
