const bot = require('./Main_Melius');
const moment = require('moment');
moment.locale('fr');

const cron = require('node-cron');
const jsdom = require('jsdom');
const fs = require('fs');
const request = require('request-promise-native');

async function jokeOfTheDayTask () {
    const task = cron.schedule('15 7 * * *', async () => {
        const htmlBody = await bot.getData('http://blague.dumatin.fr/');

        const { JSDOM } = jsdom;
        const dom = new JSDOM(htmlBody);
        const $ = (require('jquery'))(dom.window);

        const tab = $('#blaguedujour');

        const title = $($(tab).find('h2')).text();
        let joke = '';
        $(tab).find('p').each(function () {
            joke += $(this).text() + '\n';
        });

        joke = joke.replace(new RegExp('<br>', 'g'), '');
        joke = joke.replace(new RegExp('&nbsp;', 'g'), '');

        bot.client.channels.forEach(channel => {
            if (channel.type === 'text') {
                bot.client.channels.get(channel.id).send(`:poop:   Joke of the day !   :joy:   =>   ${title}\n\n${joke}`);
            }
        })
    });

    task.start();
}

async function compareSchedulesTask () {
    //'*/30 6-17 * * *'
    const task = cron.schedule('*/2 * * * *', async () => {
        const data = fs.readFileSync('app/data/schedules.json');
        const savedData = JSON.parse(data);

        let schedule;

        schedule = await getEpsiSchedule('week');
        schedule.push(await getEpsiSchedule('nextweek'));
        
        const indexOfDataChange = [];
        for (let i = 0; i < savedData.length; i++) {
            if (JSON.stringify(savedData[i]) !== JSON.stringify(schedule[i])) {
                indexOfDataChange.push(i);
            }
        }

        if (indexOfDataChange.length !== 0) {
            let msg = '';
            indexOfDataChange.forEach(index => {
                msg += `Ancien cours : ${savedData[index].date} : **${savedData[index].matiere}** de __${savedData[index].debut}__ à __${savedData[index].fin}__ en salle __${savedData[index].salle}__ avec **${savedData[index].prof}**\n`;
                msg += `Nouveau cours : ${schedule[index].date} : **${schedule[index].matiere}** de __${schedule[index].debut}__ à __${schedule[index].fin}__ en salle __${schedule[index].salle}__ avec **${schedule[index].prof}**\n\n`;
            });

            if (msg.length > 2000) {
                const splittedMsg = bot.splitMessage(msg);

                splittedMsg.forEach(str => {
                    bot.client.channels.get('546711751672987674').send(`@everyone Changement dans l'emplois du temps !\n\n${str}`);
                })
            } else {
                bot.client.channels.get('546711751672987674').send(`@everyone Changement dannt dans l'emplois du temps !\n\n${msg}`);
            }

            save2WeekInLocalData();
        }
    });

    task.start();
}

async function saveDataTask () {
    save2WeekInLocalData();

    const task = cron.schedule('0 3 * * *', async () => {
        save2WeekInLocalData();
    });

    task.start();
}

async function save2WeekInLocalData () {
    let schedule;

    schedule = await getEpsiSchedule('week');
    schedule.push(await getEpsiSchedule('nextweek'));
    const writeData = JSON.stringify(schedule);
    fs.writeFile('app/data/schedules.json', writeData, (error) => {
        error ? console.log(error) : console.log('Successful saving schedule!');
    });
}


async function getEpsiSchedule(date) {
    const url = `http://eclisson.duckdns.org:3000/schedule/${date}`
    let schedule = await request(url, {method: 'GET'})
    schedule = JSON.parse(schedule);
    return schedule
}

async function tomorrowScheduleTask() {
    const task = cron.schedule('30 7 * * *', async () => {
        let schedule = await getEpsiSchedule('tomorrow')
        let msg = '';

        if(schedule.length > 0) {
          schedule.forEach(item => {
            msg += `${item.date} : **${item.matiere}** de __${item.debut}__ à __${item.fin}__ en salle __${item.salle}__ avec **${item.prof}**\n`;
          })

          bot.client.channels.get('387249474625601537').send(msg);
        } else {
          bot.client.channels.get('387249474625601537').send('Auncun cours prévue !');
        }
    })

    task.start();
}

async function todayScheduleTask() {
    const task = cron.schedule('0 21 * * *', async () => {
        let schedule = await getEpsiSchedule('today')
        let msg = '';

        if(schedule.length > 0) {
          schedule.forEach(item => {
            msg += `${item.date} : **${item.matiere}** de __${item.debut}__ à __${item.fin}__ en salle __${item.salle}__ avec **${item.prof}**\n`;
          })

          bot.client.channels.get('387249474625601537').send(msg);
        } else {
          bot.client.channels.get('387249474625601537').send('Auncun cours prévue !');
        }
    })

    task.start();
}

module.exports.jokeOfTheDayTask = jokeOfTheDayTask;
module.exports.saveDataTask = saveDataTask;
module.exports.compareSchedulesTask = compareSchedulesTask;
module.exports.tomorrowScheduleTask = tomorrowScheduleTask;
module.exports.todayScheduleTask = todayScheduleTask;