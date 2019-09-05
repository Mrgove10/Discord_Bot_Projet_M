const bot = require('./Main_Melius');
const moment = require('moment');
moment.locale('fr');

const cron = require('node-cron');
const jsdom = require('jsdom');
const fs = require('fs');

async function jokeOfTheDayTask() {
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

        bot.client.channels.get('554923621643190279').send(`:poop:   Joke of the day !   :joy:   =>   ${title}\n\n${joke}`);
        bot.client.channels.get('546711751672987674').send(`:poop:   Joke of the day !   :joy:   =>   ${title}\n\n${joke}`);
    });

    task.start();
}

async function compareSchedulesTask() {
    const task = cron.schedule('*/30 6-17 * * *', async () => {
        const data = fs.readFileSync('./app/data/schedules.json');
        const savedData = JSON.parse(data);

        let schedule = { 'data': [] };
        const today = moment();

        schedule = await fetchData(today.clone(), today.weekday(), schedule);
        schedule = await fetchData(today.clone().weekday(7), 0, schedule);

        const indexOfDataChange = [];
        for (let i = 0; i < savedData.data.length; i++) {
            if (JSON.stringify(savedData.data[i]) !== JSON.stringify(schedule.data[i])) {
                indexOfDataChange.push(i);
            }
        }

        if (indexOfDataChange.length !== 0) {
            let msg = '';
            indexOfDataChange.forEach(index => {
                msg += `Ancien cours : ${savedData.data[index].lessonDate} : **${savedData.data[index].matiere}** de __${savedData.data[index].debut}__ à __${savedData.data[index].fin}__ en salle __${savedData.data[index].salle}__ avec **${savedData.data[index].prof}**\n`;
                msg += `Nouveau cours : ${schedule.data[index].lessonDate} : **${schedule.data[index].matiere}** de __${schedule.data[index].debut}__ à __${schedule.data[index].fin}__ en salle __${schedule.data[index].salle}__ avec **${schedule.data[index].prof}**\n\n`;
            });

            if (msg.length > 2000) {
                const splittedMsg = bot.splitMessage(msg);

                splittedMsg.forEach(str => {
                    bot.client.channels.get('554923621643190279').send(`@everyone Changement dans l'emplois du temps !\n\n${str}`);
                    bot.client.channels.get('546711751672987674').send(`@everyone Changement dans l'emplois du temps !\n\n${str}`);
                })
            } else {
                bot.client.channels.get('554923621643190279').send(`@everyone Changement dans l'emplois du temps !\n\n${msg}`);
                bot.client.channels.get('546711751672987674').send(`@everyone Changement dans l'emplois du temps !\n\n${msg}`);
            }

            save2WeekInLocalData();
        }
    });

    task.start();
}

async function saveDataTask() {
    save2WeekInLocalData();

    const task = cron.schedule('0 3 * * *', async () => {
        save2WeekInLocalData();
    });

    task.start();
}

async function tomorrowScheduleTask() {
    const task = cron.schedule('0 21 * * *', async () => {
        const today = moment();
        const tomorrow = today.clone().date(today.date() + 1);
        let msg = '';

        const url = bot.getUrl(tomorrow.date(), tomorrow.month() + 1, tomorrow.year());
        const htmlBody = await bot.getData(url);
        msg = bot.getLessonInfos(htmlBody, msg, tomorrow);

        bot.client.channels.get('554923621643190279').send(msg);
        bot.client.channels.get('546711751672987674').send(msg);
    })

    task.start();
}

async function todayScheduleTask() {
    const task = cron.schedule('30 7 * * *', async () => {
        const today = moment();
        let msg = '';

        const url = bot.getUrl(today.date(), today.month() + 1, today.year());
        const htmlBody = await bot.getData(url);
        msg = bot.getLessonInfos(htmlBody, msg, tomorrow);

        bot.client.channels.get('554923621643190279').send(msg);
        bot.client.channels.get('546711751672987674').send(msg);
    })

    task.start();
}

async function save2WeekInLocalData() {
    let schedule = { 'data': [] };

    const today = moment();
    schedule = await fetchData(today.clone(), today.weekday(), schedule);
    schedule = await fetchData(today.clone().weekday(7), 0, schedule);
    const writeData = JSON.stringify(schedule);
    fs.writeFile('./app/data/schedules.json', writeData, () => {
        console.log('Successful saving schedule!');
    });
}

async function fetchData(date, dayOfWeek, schedule) {
    for (let j = dayOfWeek; j < 5; j++) {
        date.weekday(j);
        const url = bot.getUrl(date.date(), date.month() + 1, date.year());
        const htmlBody = await bot.getData(url);

        schedule = fetchDomElement(schedule, htmlBody, date);
    }

    return schedule;
}

function fetchDomElement(schedule, htmlBody, date) {
    const { JSDOM } = jsdom;
    const dom = new JSDOM(htmlBody);
    const $ = (require('jquery'))(dom.window);

    let dayOfWeek = moment(date).format('dddd');
    dayOfWeek = bot.firstLetterToUpper(dayOfWeek);
    let month = moment(date).format('MMMM');
    month = bot.firstLetterToUpper(month);

    const tab = $('.Ligne');

    for (let k = 0; k < tab.length; k++) {
        schedule.data.push(
            {
                'lessonDate': `${dayOfWeek} ${date.date()} ${month}`,
                'matiere': $($(tab[k]).find('.Matiere')).html(),
                'debut': $($(tab[k]).find('.Debut')).html(),
                'fin': $($(tab[k]).find('.Fin')).html(),
                'prof': $($(tab[k]).find('.Prof')).html(),
                'salle': $($(tab[k]).find('.Salle')).html()
            });
    }

    if (tab.length === 0) {
        schedule.data.push(
            {
                'lessonDate': `${dayOfWeek} ${date.date()} ${month}`,
                'matiere': 'Aucun cours'
            });
    }

    return schedule;
}

module.exports.jokeOfTheDayTask = jokeOfTheDayTask;
module.exports.saveDataTask = saveDataTask;
module.exports.compareSchedulesTask = compareSchedulesTask;
module.exports.tomorrowScheduleTask = tomorrowScheduleTask;
module.exports.todayScheduleTask = todayScheduleTask;
