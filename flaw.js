var Discord = require("discord.js");
var config = require("./config.json");
var fs = require("fs");
var bot = new Discord.Client();
const prefix = "~~~";

bot.on("ready", () => {
    console.log("AFlaw is ready");
    console.log(`ID: ${bot.user.id}`);
    console.log(`Username: ${bot.user.username}`);
});

bot.on("disconnect", () => {
    console.log("AFlaw is disconnecting");
});

bot.on("message", msg => {
    if (msg.author.id != bot.user.id || !msg.content.startsWith(prefix)) return;

    let messageContent = msg.content.split(" ");
    let command = messageContent[0].slice(prefix.length);
    let fromBotChannel = msg.channel.id == config.botTestID;

    if (command === "watch") {
        console.log(`Is someone mentioned" ${msg.mentions.users.size!=0}`)
        console.log(messageContent[1]);
        let user = msg.mentions.users.size!=0 ? msg.mentions.users.first() : messageContent[1];
        msg.delete();
        watch(msg.mentions.users.size!=0 ? user.username : user);
        console.log(`Watching ${msg.mentions.users.size!=0 ? user.username : user}`);
        msg.author.sendMessage(`Watching ${msg.mentions.users.size!=0 ? user.username : user}`);
    }

    if (command === "testDM") {
        // bot.fetchUser(config.flawBotID);
        // bot.channels.get(config.botTestID).sendMessage("This is a test DM");
        // msg.author.sendMessage("This is a test DM");
        console.log(`Sending test message to: ${bot.users.get(config.flawBotID).username}`);
    }
});

bot.on("presenceUpdate", (oldUser, newUser) => {
    try {
        let users = JSON.parse(fs.readFileSync("./watchlist.json"));
    if (users[oldUser.user.username]) {
        if ((oldUser.presence.status === "offline") && (newUser.presence.status != "offline")) {
            bot.channels.get(config.botTestID).sendMessage(`${oldUser.user.username} is ${newUser.presence.status}`);
        }
    }
    } catch (error) {
        console.error(error);
    }
});

bot.login(config.userToken);

function watch(user) {
    try {
        let userObject = JSON.parse(fs.readFileSync("./watchlist.json"));
        userObject[user] = user;
        console.log(JSON.stringify(user));
        fs.writeFileSync("./watchlist.json", JSON.stringify(userObject));
    } catch (error) {
        console.error(error);
    }
}