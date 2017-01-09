var Discord = require("discord.js");
var config = require("./config.json");
var fs = require("fs");
var wfa = require("write-file-atomic").sync;
var watchlist = {}
var bot = new Discord.Client();
const prefix = "~~~";

bot.on("ready", () => {
    console.log("AFlaw is ready");
    console.log(`ID: ${bot.user.id}`);
    console.log(`Username: ${bot.user.username}`);
});

process.on('SIGINT', () => {
    console.log("AFlaw is exiting");
});

bot.on("message", msg => {
    if (msg.author.id != bot.user.id || msg.content.substring(0, 3) != prefix) return;
     console.log(`The first three characters are: ${msg.content.substring(0, 3)}`);

    let messageContent = msg.content.split(" ");
    let command = messageContent[0].slice(prefix.length);
    let fromBotChannel = msg.channel.id == config.botTestID;

    if (command === "watch") {
        console.log("Watch command");
        console.log(`Is someone mentioned: ${msg.mentions.users.size!=0}`);
        console.log(messageContent[1]);
        let user = msg.mentions.users.size!=0 ? msg.mentions.users.first() : messageContent[1];
        if (msg.channel.id != config.botTestID) msg.delete();
        watch(msg.mentions.users.size!=0 ? user.username : user);
        bot.channels.get(config.botTestID).sendMessage(`Watching ${msg.mentions.users.size!=0 ? user.username : user}`)
        .then(message => {
            console.log(`Sent watch message: ${message.content}`);
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
            console.log(`Sent unwatch message: ${message.content}`);
            message.delete();
        })
        .catch(console.error);
    }

    if (command === "testDM") {
        bot.channels.get(config.botTestID).sendMessage("This is a test DM");
        console.log(`Sending test message`);
    }
});

bot.on("presenceUpdate", (oldUser, newUser) => {
    try {
        // var userObject = JSON.parse(fs.readFileSync("./watchlist.json", 'utf8'));
        fs.readFile("./watchlist.json", 'utf8', (err, data) => {
            if (err) throw err;
            var userObject = JSON.parse(data);
            if (userObject[oldUser.user.username]) {
                if ((oldUser.presence.status != "online") && (newUser.presence.status != "offline")) {
                    bot.channels.get(config.botTestID).sendMessage(`${oldUser.user.username} is ${newUser.presence.status}`);
                }
        }
        });
    } catch (error) {
        console.error(error);
    }
});

bot.login(config.userToken);

function watch(user) {
    try {
        fs.readFile("./watchlist.json", 'utf8', (err, data) => {
            if (err) throw err;
            let userObject = JSON.parse(data);
            userObject[user] = user;
            fs.writeFile("./watchlist.json", JSON.stringify(userObject));
        });
        return;
    } catch (error) {
        console.error(error);
    }
}

function unwatch(user) {
    try {
        fs.readFile("./watchlist.json", 'utf8', (err, data) => {
            if (err) throw err;
            let userObject = JSON.parse(data);
            delete userObject[user];
            fs.writeFile("./watchlist.json", JSON.stringify(userObject));
        });
        return;
    } catch (error) {
        console.error(error);
    }
}