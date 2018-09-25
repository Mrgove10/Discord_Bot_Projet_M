//Packets
const Discord = require("discord.js");
const schedule = require('node-schedule');

//Files
const phraseObj = require("./phrase.json")
const config = require("./config.json");
const JsonPackage = require('.././package.json');
const client = new Discord.Client();

client.on("ready", () => {
  console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);

  client.user.setActivity(`Hacker la bank`); //met a jour le "playing whit"

  //#region envoie automatique
  //https://www.npmjs.com/package/node-schedule
  var j = schedule.scheduleJob('0 45 7 * * *', function () {
    client.channels.get("387249474625601537").send('euhhh oui, Bonjour, bonne chournéé');
  });
  var j = schedule.scheduleJob('0 45 21 * * *', function () {
    client.channels.get("387249474625601537").send('euhhh oui, Bonne nuit, demain caféé douceur');
  });
  //#endregion
});

client.on("message", async message => {
  console.log("message received : " + message.content);
  var ayy = message.guild.emojis.find("name", "oui");

  if (message.author.bot) return; //si le message est vide

  if (message.content.indexOf(config.prefix) !== 0) return; // si la commande c'est pas au debut

  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  if (command === "help" || command === "?" || command === "aide") {
    message.channel.send(`Toute les commandes doivent etre prifixé par "+m"
    Les commandes disponible sont: 
    - ? / Help / Aide : Aides sur les commandes  
    - Ping : Pong!
    - Musique : c'est LA musique !
    - Oui : euhhh oui chez la frase culte
    - Shitbook : renvoie le lien vers le Yearbook
    - About : informations diverse
    `);
  }

  if (command === "ping") {
    message.channel.send(`Pong!`);
  }

  if (command === "musique") {
    message.channel.send('https://soundcloud.com/nicolas-asri/shutrap/s-onxUc');
  }

  if (command === "oui") {
    var i = getRandomInt(phraseObj.ListPhrase.length);
    message.channel.send(phraseObj.ListPhrase[i] + `${ayy}`);
  }

  if (command === "shitbook") {
    message.channel.send('https://testing.adrienrichard.com/YearBook/');
  }

  if (command === "about") {

    var time = process.uptime(); //temps depuis le demararge
    var uptime = (time + "").toHHMMSS(); //conversion en lisible
    var nowtime = new Date(); //date actuel 
    var version = JsonPackage.version; //recuperation de la version de l'appli

    
    var m = await message.channel.send("Ping en cours...");//envoie du message
    //Mofification du message
    m.edit(`
    ----- MeliusBot v${version} -----
    Phrases : Macha & Leo
    Bot : Adrien
    Temps depuis le dernier redemarage : ${uptime}
    Heure server : ${nowtime}
    Latence : ${m.createdTimestamp - message.createdTimestamp}ms
    Latence API : ${Math.round(client.ping)}ms
    Lien Github : <https://github.com/Mrgove10/Discord_Bot_Projet_M>, je suis open Source !
   `);
  }
});

client.login(config.token);

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

String.prototype.toHHMMSS = function () {
  var sec_num = parseInt(this, 10); // don't forget the second param
  var days = Math.floor(sec_num / (3600 * 24));
  var hours = Math.floor(sec_num / 3600);
  var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
  var seconds = sec_num - (hours * 3600) - (minutes * 60);

  if (24 < 10) {
    days = "0" + days;
  }
  if (hours < 10) {
    hours = "0" + hours;
  }
  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  if (seconds < 10) {
    seconds = "0" + seconds;
  }
  var time = days + ":" + hours + ':' + minutes + ':' + seconds;
  return time;
}