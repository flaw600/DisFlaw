var Discord = require("discord.js");
var config = require("./config.json");
var fs = require("fs");
var bot = new Discord.Client();
var readyCount = 0;
const prefix = "~";
const watchlist = "./watchlist.json";
const friendList = {};

bot.on("ready", () => {
    readyCount++;
    console.log("AFlaw is ready");
    console.log(`ID: ${bot.user.id}`);
    console.log(`Username: ${bot.user.username}`);
    // console.log(bot.presences);
    // console.log(bot.user.friends);
    checkFriendsStatuses(readyCount);
    // watchForFriendPresenceUpdate(readyCount);
});

process.on('SIGINT', () => {
    console.log("AFlaw is exiting");
});

bot.on("message", msg => {
    if (msg.author.id != bot.user.id || msg.content.substring(0, 1) != prefix) return;

    let messageContent = msg.content.split(" ");
    let command = messageContent[0].slice(prefix.length);
    let fromBotChannel = msg.channel.id == config.botTestID;

    if (command === "watch") {
        // console.log("Watch command");
        // console.log(`Is someone mentioned: ${msg.mentions.users.size!=0}`);
        // console.log(messageContent[1]);
        let user = msg.mentions.users.size!=0 ? msg.mentions.users.first() : messageContent[1];
        if (!fromBotChannel) msg.delete();
        watch(msg.mentions.users.size!=0 ? user.username : user);
        bot.channels.get(config.botTestID).sendMessage(`Watching ${msg.mentions.users.size!=0 ? user.username : user}`)
        .then(message => {
            // console.log(`Sent watch message: ${message.content}`);
            message.delete();
        })
        .catch(console.error);
    }

    if (command === "unwatch") {
        let user = msg.mentions.users.size!=0 ? msg.mentions.users.first() : messageContent[1];
        if (msg.channel.id != config.botTestID) msg.delete();
        unwatch(msg.mentions.users.size!=0 ? user.username : user);
        bot.channels.get(config.botTestID).sendMessage(`No longer watching ${msg.mentions.users.size!=0 ? user.username : user}`)
        .then(message => {
            // console.log(`Sent unwatch message: ${message.content}`);
            message.delete();
        })
        .catch(console.error);
    }

    if (command === "testDM") {
        bot.channels.get(config.botTestID).sendMessage("This is a test DM");
        // console.log(`Sending test message`);
    }
});

bot.on("presenceUpdate", (oldUser, newUser) => {
    try {
        // if (oldUser.client.user.id in bot.user.friends.keys) return;
        fs.readFile(watchlist, 'utf8', (err, data) => {
            if (err) throw err;
            var userObject = JSON.parse(data);
            if (userObject[oldUser.user.username.replace(/\s/g, '')]) {
                if ((oldUser.presence.status != "online") && (newUser.presence.status != "offline")) {
                    console.log("presenceUpdate");
                    sendStatusMessage(`${oldUser.user.username} is ${newUser.presence.status}`);
                }
            //     userObject[[oldUser.user.username.replace(/\s/g, '')]] = newUser.presence.status;
            //     fs.writeFile(watchlist, JSON.stringify(userObject), err => {
            //        if (err) console.log(err); 
            //     });
            }
        });
    } catch (error) {
        console.error(error);
    }
});

bot.login(config.userToken);

function watch(user) {
    try {
        fs.readFile(watchlist, 'utf8', (err, data) => {
            if (err) throw err;
            let userObject = JSON.parse(data);
            userObject[user] = user;
            fs.writeFile(watchlist, JSON.stringify(userObject));
        });
    } catch (error) {
        console.error(error);
    }
}

function unwatch(user) {
    try {
        fs.readFile(watchlist, 'utf8', (err, data) => {
            if (err) throw err;
            let userObject = JSON.parse(data);
            delete userObject[user];
            fs.writeFile(watchlist, JSON.stringify(userObject));
        });
    } catch (error) {
        console.error(error);
    }
}

function checkFriendsStatuses(count) {
    if (count > 1) return;
    let friendPresences = bot.presences;
    console.log(friendPresences.keyArray().toString());
    friendPresences.keyArray().forEach((val, index, presences) => {
        friendList[friendPresences.keyArray()[index]] = friendPresences.get(val)["status"];
    });
    console.log(friendList);
}

// function watchForFriendPresenceUpdate(count) {
//     if (count > 1) return;
//     while(true) {
//         // let friendPresences = bot.presences;
//         // let friends = bot.user.friends;
//         // let friendPresencesKeys = friendPresences.keys;
//         // let friendKeys = friends.keys;
//         // let guilds = bot.guilds;
//         for ()
//     }
// }

function sendStatusMessage(msg) {
     bot.channels.get(config.botTestID).sendMessage(msg)
    .then(message => {
        console.log(message.content);
         message.delete();  
    })
    .catch(console.error);
}