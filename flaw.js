require('newrelic');
var Discord = require("discord.js");
// var fs = require("fs");
var cron = require("node-schedule");
var bot = new Discord.Client( {fetchAllMembers: true} );
var readyCount = 0;
var cronCounter = 0;
// var watchlist = './watchlist.json';
const prefix = "~";
const friendList = {};

cron.scheduleJob('*/1 * * * *', () => {
    cronCounter++;
    console.log(cronCounter);
    watchForFriendPresenceUpdate("cron");
});

bot.on("ready", () => {
    readyCount++;
    console.log("AFlaw is ready");
    console.log(`Status: ${bot.user.presence.status}`);
    console.log(`ID: ${bot.user.id}`);
    console.log(`Username: ${bot.user.username}`);
    // console.log(bot.presences);
    // console.log(bot.user.friends);
    checkFriendsStatuses(readyCount);
    // watchForFriendPresenceUpdate("ready");
});

process.on('SIGTERM', () => {
    console.log("AFlaw is exiting");
});

bot.on("message", msg => {
    if (msg.author.id != bot.user.id || msg.content.substring(0, 1) != prefix) return;

    let messageContent = msg.content.split(" ");
    let command = messageContent[0].slice(prefix.length);
    let fromBotChannel = msg.channel.id == process.env.BOT_TEST_ID;

    if (command === "watch") {
        // console.log("Watch command");
        // console.log(`Is someone mentioned: ${msg.mentions.users.size!=0}`);
        // console.log(messageContent[1]);
        let user = msg.mentions.users.size!=0 ? msg.mentions.users.first() : messageContent[1];
        if (!fromBotChannel) msg.delete();
        watch(msg.mentions.users.size!=0 ? user.username : user);
        sendStatusMessage(`Watching ${msg.mentions.users.size!=0 ? user.username : user}`);
    }

    if (command === "unwatch") {
        let user = msg.mentions.users.size!=0 ? msg.mentions.users.first() : messageContent[1];
        if (msg.channel.id != process.env.BOT_TEST_ID) msg.delete();
        unwatch(msg.mentions.users.size!=0 ? user.username : user);
        sendStatusMessage(`No longer watching ${msg.mentions.users.size!=0 ? user.username : user}`);
    }

    if (command === "testDM") {
        sendStatusMessage("This is a Test DM");
        // console.log(`Sending test message`);
    }
});

bot.on("presenceUpdate", (oldUser, newUser) => {
    try {
        let userObject = JSON.parse(process.env.WATCHLIST);
        if (userObject[oldUser.user.username.replace(/\s/g, '')]) {
            if (newUser.presence.status === "offline" || newUser.presence.status === "online") {
                console.log(`presenceUpdate: ${oldUser.client.user.username}`);
                sendStatusMessage(`${oldUser.user.username} is ${newUser.presence.status}`, "presenceUpdate");
                if (friendList[oldUser.user.username]) {
                    friendList[oldUser.user.username] = newUser.presence.status;
                    console.log("Friend presenceUpdate:");
                    console.log(friendList);
                }
            }
        }
    } catch (error) {
        console.error(error);
    }
});

bot.login(process.env.USER_TOKEN).then(() => bot.user.setStatus("invisible")).catch(err => console.error(err));

function watch(user) {
    try {
        let userObject = JSON.parse(process.env.WATCHLIST);
        userObject[user] = user;
        console.log(userObject);
        process.env.WATCHLIST = JSON.stringify(userObject);
    } catch (error) {
        console.error(error);
    }
}

function unwatch(user) {
    try {
        let userObject = JSON.parse(process.env.WATCHLIST);
        delete userObject[user];
        console.log(userObject);
            process.env.WATCHLIST = JSON.stringify(userObject);
    } catch (error) {
        console.error(error);
    }
}

function checkFriendsStatuses(count) {
    if (count > 1) return;
    let friends = bot.user.friends;
    friends.keyArray().forEach((val) => {
        friendList[friends.get(val).username] = friends.get(val).presence["status"];
    });
    console.log("checkFriendsStatuses: ");
    console.log(friendList);
}

function watchForFriendPresenceUpdate(method) {
    let friends = bot.user.friends;
    friends.keyArray().forEach((val) => {
        if ((friendList[friends.get(val).username] != friends.get(val).presence["status"]) &&
        (friends.get(val).presence["status"] === "online" || friends.get(val).presence["status"] === "offline")) {
            sendStatusMessage(`${friends.get(val).username} is ${friends.get(val).presence["status"]}`, "watchForFriendPresenceUpdate");
        }
        friendList[friends.get(val).username] = friends.get(val).presence["status"];
    });
    console.log(`watchForFriendPresenceUpdate from ${method}:`);
    console.log(friendList);
}

function sendStatusMessage(msg, method) {
     bot.channels.get(process.env.BOT_TEST_ID).sendMessage(msg)
    .then(message => {
        console.log(message.content + " from " + method);
        message.delete();  
    })
    .catch(console.error);
}