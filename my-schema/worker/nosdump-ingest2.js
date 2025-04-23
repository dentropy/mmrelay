import fs from "node:fs";
import readline from "node:readline";
import { verifyEvent } from "nostr-tools";
import path from "node:path";
// Read all the nostr events from a nosdump file

// Hook up to Postgres
import sql from "./db.js";
let result = await sql`SELECT NOW() as now;`;
console.log(result);
// if ("now" in result.rows[0]) {
//     console.log("Sucessfully connected to postgres")
// } else {
//     console.log("Could not connect to postgres")
//     process.exit()
// }

let jsonnl_filename =
    "./ScrapedData/bagaaierabnjlhwalrbidwukf7mb5fcecjpyii6t2o76cmgt6vnjbdfjwmjja.jsonl";

// Count the number of lines
async function count_line_num(file_name) {
    return new Promise((resolve, reject) => {
        let count = 0;

        const stream = fs.createReadStream(file_name);

        stream.on("data", (chunk) => {
            for (let i = 0; i < chunk.length; ++i) {
                if (chunk[i] === 10) count++; // 10 is newline '\n'
            }
        });

        stream.on("end", () => {
            resolve(count);
        });

        stream.on("error", (err) => {
            reject(err);
        });
    });
}

// // const line_count_test = await count_line_num("./index.js")
// // console.log(line_count_test)

// https://stackoverflow.com/questions/16010915/parsing-huge-logfiles-in-node-js-read-in-line-by-line
async function load_lines(file_name, line_start, line_end, verify_events=true) {
    return new Promise((resolve, reject) => {
        const instream = fs.createReadStream(file_name);
        let count = 0;
        let lines = [];

        const rl = readline.createInterface({
            input: instream,
            crlfDelay: Infinity,
            terminal: false,
        });

        rl.on("line", (line) => {
            if (count > line_start && count < line_end) {
                if( verify_events == true) {
                    let new_line = JSON.parse(line)
                    new_line.is_verified = verifyEvent(new_line)
                    new_line.raw_event = line
                    lines.push(new_line);
                } else {
                    let new_line = JSON.parse(line)
                    new_line.is_verified = false
                    new_line.raw_event = line
                    lines.push(new_line);
                }
            }
            count += 1;
        });

        rl.on("close", () => {
            resolve(lines);
        });

        rl.on("error", (err) => {
            reject(err);
        });
    });
}

// const load_liens_test = await load_lines("./index.js", 20, 30)
// console.log("response")
// console.log(load_liens_test)

// Load metadata
let parts = jsonnl_filename.split(path.sep);
parts[parts.length - 1] = "metadata-" + parts[parts.length - 1];
const metadata_filepath = parts.join("/").slice(0, -1);
console.log(metadata_filepath);
let metadata = JSON.parse(fs.readFileSync(metadata_filepath));
console.log(metadata);
const relay_url = metadata.relay;
const filter = metadata.filter;

const line_count = await count_line_num(jsonnl_filename);
console.log("count_line_num(jsonnl_filename)")
console.log(line_count);
for (let count = 0; count < line_count; count += 10000) {
    console.log("About to load lines")
    const loaded_lines = await load_lines(
        jsonnl_filename,
        count,
        count + 10000,
        false
    )
    console.log("Loaded Lines")
    console.log("About to Insert")
    await sql`insert into normalized_nostr_events ${ sql(loaded_lines) } ON CONFLICT DO NOTHING;`
    console.log("Done")
}
await sql.end()
process.exit()
