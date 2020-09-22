const Discord = require('discord.js');
const ytdl = require('ytdl-core-discord');
const client = new Discord.Client();
const prefix = process.env.prefix;

var userCooldowns = {};
var songQueue = null;

//Display status on ready and configures userCooldowns
client.on('ready', () => {
    console.log('Online');
    setInterval(function(){ for (userx in userCooldowns){if(userCooldowns[userx] > 0){userCooldowns[userx]-= 1;} }; }, 3000);
})

//
client.on('message', message => {
  if(message.content.startsWith(`${prefix}test`)){
    sendMessage(message, '✓');
  }

  if(message.content.startsWith(`${prefix}quack`)){
    playSound(message, './sounds/mac-quack.mp3', ':duck:')
  }

  if(message.content.startsWith(`${prefix}quackquack`)){
    playSound(message, './sounds/birding.mp3', ':duck: :duck:')
  }

  if(message.content.startsWith(`${prefix}jukebox`)){
    startJukebox(message); 
  }
});

/*
============================================
  Functions
============================================
*/

/*
* Send a message in chat current chat channel
*
* message: Object
* botResponse: String
*
*/

async function sendMessage(message, botResponse) {
  message.channel.send(botResponse);
}

/*
* Send a message in chat current chat channel then delete message after 
*
* message: Object
* botResponse: String
* delay: Integer
*
*/

async function sendAndDeleteMessage(message, botResponse, delay) {
  message.channel.send(botResponse).then(msg => { msg.delete(delay); });
}

/*
* Play sound file and optionally send a message in chat current chat channel
*
* message: Object
* sound: String
* botResponse: String
*
*/
async function playSound(message, sound, botResponse) {
  if(message.member.voiceChannel && (userCooldowns[message.member.author] == undefined || userCooldowns[message.member.author] == 0)){
    userCooldowns[message.member.author] = 10;
    let channel = message.member.voiceChannel;
    channel.join()
    .then(connection => {
      const dispatcher = connection.playFile(sound, {});

      if(botResponse) {
        message.channel.send(botResponse);
      }
      dispatcher.on('end', () =>  {
        message.member.voiceChannel.leave();
      });
    })
    .catch(error => {
      console.log(error);
    });
  }
  else{
    if (message.member.voiceChannel && (userCooldowns[message.member.username] != undefined || userCooldowns[message.member.username] > 0)){
        message.reply('Cooldown remaining: ' + userCooldowns[message.member.author]);
    }
    else{
        message.reply('You need to join a channel first!');
    }
  }
}

/*
* Create song queue if one doesn't exist then join voice channel and add song to queue 
*
* message: Object
*
*/
async function startJukebox(message) {
  let url = message.content.split(' ')[1];
  let textChannel = message.channel;
  let voiceChannel = message.member.voiceChannel;
  let songInfo = await ytdl.getInfo(url);

  let song = {
    title: songInfo.title,
    url: songInfo.video_url
  };

  if(!queue) {
    const songQueue = {
      textChannel: textChannel,
      voiceChannel: voiceChannel,
      connection: null,
      songs: [],
      volume: 5,
      playing: true
    }

    songQueue.songs.push(song);

    voiceChannel.join()
      .then(connection => {
        songQueue.connection = connection;
        play(song, songQueue);
      })
      .catch(error => {
        console.log(error);
      });
  }

  else {
    songQueue.songs.push(song);
    sendMessage(`${song.title} added to the queue`);
  }

  message.member.voiceChannel.join()
      .then(connection => {
        play(connection, url);
      })
      .catch(error => {
        sendMessage(message, 'An error occured trying to play this song');
        console.log(error);
      })
}
/*
* Play first song in queue, then removes song from queue and play next song. Leaves voice channel if no songs in queue
*
* songQueue: Object
*
*/

async function play(songQueue) {
  if(songQueue.songs.length === 0) {
    songQueue.voiceChannel.leave();
    songQueue = null;
    return;
  }
  let song = songQueue.songs[0];
  
  const dispatcher = songQueue.connection
    .playOpusStream(await ytdl())
    .on('finish', () => {
      songQueue.songs.shift();
      play(songQueue);
    })
    .on('error', error => {
      console.log('error')
    })
    dispatcher.setVolumeLogarithmic(songQueue.volume / 5);
    songQueue.textChannel.send(`Now playing: ${song.title}`);
}

client.login(process.env.token);
