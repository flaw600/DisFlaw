var fs = require("fs");

if (!fs.existsSync("./watchlist.json")) {
    fs.writeFile("./watchlist.json", "{}", {flag: 'wx'},  (err) => {
        if (err) console.error(err);
    });
}