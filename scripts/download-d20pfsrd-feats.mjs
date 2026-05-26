import fs from "node:fs";
import https from "node:https";
import path from "node:path";

const url =
  "https://spreadsheets.google.com/spreadsheet/pub?key=0Ak-IxjmMq9NMdHhobmxRSzBJQ2JjVXJaYkFwZjM0MlE&single=true&gid=0&output=csv";

const outputPath = path.resolve("imports/feats.csv");

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

        if (res.statusCode !== 200) {
          reject(new Error("Download failed with status " + res.statusCode));
          return;
        }

        let data = "";
        res.setEncoding("utf8");

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          resolve(data);
        });
      })
      .on("error", reject);
  });
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });

const csv = await download(url);

if (!csv.includes("name") || !csv.includes("benefit")) {
  console.error("Downloaded file does not look like the expected feats CSV.");
  console.error(csv.slice(0, 500));
  process.exit(1);
}

fs.writeFileSync(outputPath, csv);
console.log("Downloaded d20PFSRD Feats_OGL CSV -> " + outputPath);
