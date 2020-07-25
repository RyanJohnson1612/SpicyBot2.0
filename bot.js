const Discord = require('discord.js');
const client = new Discord.Client();
const settings = require('./config.json');

var userCooldowns = {};

client.on('ready',() => {
    console.log('Online');
    setInterval(function(){ for (userx in userCooldowns){if(userCooldowns[userx] > 0){userCooldowns[userx]-= 1;} }; }, 3000);
})

client.on('message', message => {
  if(message.content === '!test'){
    message.channel.send('✓');

    let channel = message.member.voiceChannel;
    channel.join()
      .then(connection => { console.log('Connected!')})
      .catch(error => { console.log(error)});
  }

  if(message.content === '!quack'){
    console.log('quack');
    message.delete(3000);
    if(message.member.voiceChannel && (userCooldowns[message.member.author] == undefined || userCooldowns[message.member.author] == 0)){
      console.log('join channel');
      userCooldowns[message.member.author] = 10;
      let channel = message.member.voiceChannel;
      console.log(userCooldowns[message.member.author]);
      channel.join()
      .then(connection => {
        console.log('channel ' + message.member.voiceChannel.name + ' joined');
        const dispatcher = connection.playFile('./sounds/mac-quack.mp3', {});
        console.log('test');
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
});

client.login(process.env.token);
