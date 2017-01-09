var Discord = require("discord.js");
var config = require("./config.json");
var bot = new Discord.Client();
const prefix = "~~~";

bot.on("ready", () => {
    console.log("FlawBot is ready");
    console.log(`ID: ${bot.user.id}`);
});

bot.on("message", msg => {
    if (msg.author.id != config.userID || msg.channel.id != config.botTestID) return;
    console.log(msg.content);

    let messageContent = msg.content.split(" ");
    let command = messageContent[0].slice(prefix.length);

    bot.fetchUser(config.userID);
    if (!msg.content.startsWith(prefix)) bot.users.get(config.userID).sendMessage(msg.content).catch(err => console.error(err));
    if (command === "deleteAll") {
        console.log("Deleting all messages");
        bot.fetchUser(config.userID);
        bot.users.get(config.userID).dmChannel.fetchMessages().then(col => col.deleteAll());
        // bot.users.get(config.userID).dmChannel.messages.deleteAll()
        // .catch(err => console.error(err));
    }
});

bot.login(config.flawBotToken);