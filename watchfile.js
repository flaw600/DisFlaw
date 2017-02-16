require('newrelic');
var fs = require("fs");

console.log(fs.existsSync("./watchlist.json"));
if (!fs.existsSync("./watchlist.json")) {
    fs.writeFile("./watchlist.json", "{}", {flag: 'wx'},  (err) => {
        if (err) console.error(err);
    });
}