//Packets
const Discord = require("discord.js");
const schedule = require('node-schedule');

//Files
const phraseObj = require("./phrase.json") 
const config = require("./config.json");
const JsonPackage = require('.././package.json');
const client = new Discord.Client();

const scheduledTask = require('./scheduled-task');
const request = require('request-promise-native');
const moment = require('moment');
moment.locale('fr');

//Variables
var lastrandom = 0
client.on("ready", () => {
  //debug
  console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);

  //Met a jour le playing whit au lancement
  client.user.setActivity(`Hacker le bank`); 

  //#region 
  //envoie automatique (https://www.npmjs.com/package/node-schedule)

  //envoie automatique du matin
  schedule.scheduleJob('0 55 7 * * *', function () {
    client.channels.get("387249474625601537").send(`euhhh oui, Bonjour, bonne chournéé`);
  });
  
  //envoie automatique du soir
  schedule.scheduleJob('0 45 21 * * *', function () {
    client.channels.get("387249474625601537").send('euhhh oui, Bonne nuit, demain caféé douceur');
  });

  //envoie automatique tous les mecredi
  schedule.scheduleJob('0 15 8 * * 3', function () {
    client.channels.get("387249474625601537").send("", {
      file: "./media/wednesday.jpg" 
    });
  });

  //changement automatique du playing whit
  schedule.scheduleJob('* * * 5 * *', function () {
    var id = makeid();
    var idd = makeid();
    client.user.setActivity(id + ` Hacker le bank ` + idd); //met a jour le "playing whit"
    console.log(makeid());
  });

  /*scheduledTask.jokeOfTheDayTask();
  scheduledTask.saveDataTask();
  scheduledTask.compareSchedulesTask();
  scheduledTask.tomorrowScheduleTask()
  scheduledTask.todayScheduleTask()*/
  //#endregion
});

//for each message
client.on("message", async message => {
  //Debug
  if (!message.author.bot) { //if the message is not from the bot
    console.log("Message recu : " + message.content); 
  }

  //emoji oui
  var Emoji_Oui = message.guild.emojis.find(x => x.name === "oui");
  
  //si le bot est mentionner il repond oui ou non
  if (message.isMentioned(client.users.get('494062611810484224'))) {
    var rep = ["euhhh oui", "euhhh non", "euhhh peut-etre" ];
    message.reply(rep[getRandomInt(3)]);
  }

  //si le message est vide
  //if (message.author.bot) return;

  // si la commande c'est pas au debut
  //if (message.content.indexOf(config.prefix) !== 0) return;

  //recupere les arguments puis la met en minucule
  const args = message.content.slice('2').trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  //Help commande
  if (command === "help" || command === "?" || command === "aide") {
    message.channel.send(`Toute les commandes doivent etre prifixé par "/m"
    Les commandes disponible sont: 
    - ? / Help / Aide : Aides sur les commandes  
    - Ping : Pong!
    - Musique : C'est LA musique !
    - Oui : Euhhh oui chez la fraze culte
    - Shitbook : Lien vers le Yearbook
    - About : Informations diverses
    - today : Emploi du temps du jour
    - tomorrow : Emploi du temps de demain
    - week : Emploi du temps de la semaine
    - nextweek : Emploi du temps de la semaine prochaine
    - infos : Infos concernant le bot de gestion de l'emploi du temps
    `);
  }

  //Ping commande
  if (command === "ping") {
    message.channel.send(`Pong!`);
  }

  //Music commande
  if (command === "musique") {
    message.channel.send('https://soundcloud.com/nicolas-asri/shutrap/s-onxUc');
  }

  //Oui commande
  if (command === "oui") {

    var i = getRandomInt(phraseObj.ListPhrase.length);
    if (i == lastrandom) { //evite que deux phrase se repete a la suite
      i = getRandomInt(phraseObj.ListPhrase.length);
      message.channel.send(phraseObj.ListPhrase[i] + `${Emoji_Oui}`);

    } else {
      message.channel.send(phraseObj.ListPhrase[i] + `${Emoji_Oui}`);
    }

    var lastrandom = i
  }

  //Shitbook commande
  if (command === "shitbook") {
    message.channel.send('https://testing.adrienrichard.com/YearBook/');
  }

  //About commande
  if (command === "about") {

    var time = process.uptime(); //temps depuis le demararge
    var uptime = (time + "").toHHMMSS(); //conversion en lisible
    var nowtime = new Date(); //date actuel 
    var version = JsonPackage.version; //recuperation de la version de l'appli

    var m = await message.channel.send("Ping en cours..."); //envoie du message

    //Mofification du message
    m.edit(`
    ----- MeliusBot v${version} -----
    Phrases : Macha & Leo
    Bot : Adrien
    Temps depuis le dernier démarrage : ${uptime}
    Heure server : ${nowtime}
    Latence Acces : ${m.createdTimestamp - message.createdTimestamp}ms
    Latence API : ${Math.round(client.ping)}ms
    Je suis Open Source : <https://github.com/Mrgove10/Discord_Bot_Projet_M> !
    `)
  }

  /*switch (message.content) {
    case '/m today':
        console.log('today')
      getEpsiSchedule('today', message)
      break;
    case '/m tomorrow':
      getEpsiSchedule('tomorrow', message)
      break;
    case '/m week':
      getEpsiSchedule('week', message)
      break;
    case '/m nextweek':
        getEpsiSchedule('nextweek', message)
      break;
    case '/m infos':
      message.channel.send('Ce bot discord à pour objectif d\'éviter au __maximum__ d\'utiliser ce fabuleux outil qu\'est ~~je vous pisse dessus sans même vous faire croire qu\'il pleut~~ BEECOME.\n\nCe que je sais faire :\n\n/m today\n/m tomorrow\n/m week\n/m nextweek\n/m infos\n\nJe vous préviens également de chaque changement dans l\'emplois du temps sur les 2 prochaines semaines !   :muscle::muscle:\nAlors, elle est pas belle la vie ?   :heart_eyes:\n\nJe suis __open source__ ! : Github https://github.com/MiniJez/Discord-bot-displaying-epsi-calendar-changes\nAuteur : Edouard CLISSON.');
  }*/
});

//Logins the client
client.login(config.token);

//Get a random int 
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

//
String.prototype.toHHMMSS = function () {
  var sec_num = parseInt(this, 10); // don't forget the second param
  var days = Math.floor(sec_num / (3600 * 24));
  var hours = Math.floor(sec_num / 3600);
  var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
  var seconds = sec_num - (hours * 3600) - (minutes * 60);

  if (days < 10) {
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

//Create a random ID
function makeid() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

/*async function getEpsiSchedule(date, message) {
  const url = `http://eclisson.duckdns.org:3000/schedule/${date}`
  let schedule = await request(url, {method: 'GET'});
  schedule = JSON.parse(schedule)
  let msg = ''

  if(schedule.length > 0) {
    schedule.forEach(item => {
      msg += `${item.date} : **${item.matiere}** de __${item.debut}__ à __${item.fin}__ en salle __${item.salle}__ avec **${item.prof}**\n`;
    })

    sendMessage(message, msg)
  } else {
    sendMessage(message, 'Aucun cours prévue !')
  }
}*/

function sendMessage (message, msg) {
  message.channel.send(msg);
}

function firstLetterToUpper (string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function splitMessage (msg) {
  const halfLength = Math.floor(msg.length / 2);
  const startMsg = msg.slice(0, halfLength);
  const endMsg = msg.slice(halfLength, msg.length);

  const splittedMsg = [];

  splittedMsg.push(startMsg);
  splittedMsg.push(endMsg);

  return splittedMsg;
}

async function getData (url) {
  return request(url);
}



module.exports.client = client;
module.exports.getData = getData;
module.exports.firstLetterToUpper = firstLetterToUpper;
module.exports.splitMessage = splitMessage;
