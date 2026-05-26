import fs from "node:fs";
import https from "node:https";

const url = "https://www.aonprd.com/Spells.aspx?Class=Wizard";

function download(targetUrl) {
  return new Promise((resolve, reject) => {
    https
      .get(targetUrl, (res) => {
        if (
          res.statusCode &&
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          resolve(download(res.headers.location));
          return;
        }

        let data = "";
        res.setEncoding("utf8");

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => resolve(data));
      })
      .on("error", reject);
  });
}

const html = await download(url);

fs.mkdirSync("imports", { recursive: true });
fs.writeFileSync("imports/aon-wizard-spells.html", html);

console.log("saved imports/aon-wizard-spells.html");
console.log("length:", html.length);
console.log("contains Magic Missile:", html.includes("Magic Missile"));
console.log("contains 0-Level:", html.includes("0-Level"));
console.log("contains 1st-Level:", html.includes("1st-Level"));
console.log("contains SpellDisplay:", html.includes("SpellDisplay.aspx"));
