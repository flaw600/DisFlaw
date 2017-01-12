var Discord = require("discord.js");
var bot = new Discord.Client();
const prefix = "~";

bot.on("ready", () => {
    console.log("FlawBot is ready");
    console.log(`ID: ${bot.user.id}`);
});

bot.on("message", msg => {
    if (msg.author.id != process.env.USER_ID || msg.channel.id != process.env.BOT_TEST_ID) return;
    console.log(msg.content);

    let messageContent = msg.content.split(" ");
    let command = messageContent[0].slice(prefix.length);

    bot.fetchUser(process.env.USER_ID);
    if (!msg.content.startsWith(prefix)) bot.users.get(process.env.USER_ID).sendMessage(msg.content).catch(err => console.error(err));
    if (command === "deleteAll") {
        console.log("Deleting all messages");
        bot.fetchUser(process.env.USER_ID);
        bot.users.get(process.env.USER_ID).dmChannel.fetchMessages().then(col => col.deleteAll());
    }
});

bot.login(process.env.FLAW_BOT_TOKEN);