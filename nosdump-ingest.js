import fs from 'fs'
import es from 'event-stream';


import sql from "./experiments/experiments/db.js";

try {
    let result = await sql`SELECT NOW() as now;`;
    console.log(result);
} catch (error) {
    console.log("Unable to connect to postgres")
    process.exit()
}

async function insert_the_data(nostr_events, nostr_events_content_indexed){
    try {
        await sql`insert into normalized_nostr_events_t ${sql(nostr_events)} ON CONFLICT DO NOTHING;`
    } catch (error) {
        console.log("ERROR, PROCESSING EVENTS INDIVIDUALLY")
        for (const nostr_event of nostr_events) {
            try {
                await sql`insert into normalized_nostr_events_t ${sql([nostr_event])} ON CONFLICT DO NOTHING;`
            } catch (error) {
                console.log("DOUBLE_ERROR")
                console.log(JSON.stringify(nostr_event))
                console.log(error)
            }
        }
    }
    console.log(`nostr_events_content_indexed.length = ${nostr_events_content_indexed.length}`)
    if (nostr_events_content_indexed.length >= 1) {
        try {
            // console.log(JSON.stringify(nostr_events_content_indexed, null, 2))
            await sql`insert into nostr_event_content_indexed ${sql(nostr_events_content_indexed)} ON CONFLICT DO NOTHING;`
        } catch (error) {
            console.log("INSERT tsvector error")
            console.log(error)
        }
    }
}
// https://stackoverflow.com/questions/16010915/parsing-huge-logfiles-in-node-js-read-in-line-by-line
async function load_nosdump_file(filepath, batch_size = 100, line_offst = 0) {
    let lineNr = 0;
    let count = 0
    let nostr_events = []
    let nostr_events_content_indexed = []
    var s = fs.createReadStream(filepath)
        .pipe(es.split())
        .pipe(es.mapSync(async function (line) {
            s.pause();
            lineNr += 1;
            if (lineNr > line_offst) {
                try {
                    var new_line = JSON.parse(line)
                    new_line.is_verified = false
                    new_line.num_tags = new_line.tags.length
                    new_line.tags = JSON.stringify(new_line.tags)
                    new_line.raw_event = line
                    nostr_events.push(new_line)
                    count += 1
                    if ([1, 10002].includes(new_line.kind) && new_line.content.length != 0) {
                        let event_to_index = {}
                        event_to_index.id = new_line.id
                        event_to_index.content = new_line.content
                        if (new_line.tags.includes("title")) {
                            try {
                                let tags = JSON.parse(new_line.tags)
                                for (const tag of tags) {
                                    if (tag[0] == "title") {
                                        event_to_index.title = tag[1]
                                        event_to_index.search_vector += "Title " + tag[1]
                                    }
                                }
                            } catch (error) {
                                console.log(`Error processing title: ${new_line.id}`)
                            }
                        }
                        if (new_line.tags.includes("summary")) {
                            try {
                                let tags = JSON.parse(new_line.tags)
                                for (const tag of tags) {
                                    if (tag[0] == "summary") {
                                        event_to_index.title = tag[1]
                                        event_to_index.search_vector += "\nSummary " + tag[1]
                                    }
                                }
                            } catch (error) {
                                console.log(`Error processing summary: ${new_line.id}`)
                            }
                        }
                        nostr_events_content_indexed.push(event_to_index)
                    }
                } catch (error) {
                    console.log(`Unable to process lineNr=${lineNr}`)
                }
                count += 1;
            }
            if (count >= batch_size && lineNr > line_offst) {
                console.log(`Inserting ${lineNr} Lines ${(new Date).toISOString()}`)
                count = 0;
                await insert_the_data(nostr_events, nostr_events_content_indexed)
                nostr_events = []
                nostr_events_content_indexed = []
                count = 0
            }
            s.resume();
        })
            .on('error', function (err) {
                console.log('Error while reading file.', err);
            })
            .on('end', async function () {
                console.log("Supposed to load rest of them")
                console.log(nostr_events.length)
                await insert_the_data(nostr_events, nostr_events_content_indexed)
                console.log('Read entire file.')
            })
        );
}

const args = process.argv.slice(2);
console.log('User arguments:', args);
load_nosdump_file(args[0], 1000)
