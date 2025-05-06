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

// https://stackoverflow.com/questions/16010915/parsing-huge-logfiles-in-node-js-read-in-line-by-line
async function load_nosdump_file(filepath, batch_size = 100, line_offst = 0) {
    let lineNr = 0;
    let count = 0
    let nostr_events = []
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
                } catch (error) {
                    console.log(`Unable to process lineNr=${lineNr}`)
                }
                count += 1;
            }
            if (count >= batch_size && lineNr > line_offst) {
                console.log(`Inserting ${lineNr} Lines`)
                count = 0;
                try {
                    await sql`insert into normalized_nostr_events_t ${sql(nostr_events)} ON CONFLICT DO NOTHING;`
                } catch (error) {
                    console.log("ERROR, PROCESSING EVENTS INDIVIDUALLY")
                    for(const nostr_event of nostr_events) {
                        try {
                            await sql`insert into normalized_nostr_events_t ${sql([nostr_event])} ON CONFLICT DO NOTHING;`
                        } catch (error) {
                            console.log("DOUBLE_ERROR")
                            console.log(JSON.stringify(nostr_event))
                            console.log(error)
                        }
                    }
                }
                nostr_events = []
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
                if (nostr_events.length >= 1) {
                    try {
                        await sql`insert into normalized_nostr_events_t ${sql(nostr_events)} ON CONFLICT DO NOTHING;`
                    } catch (error) {
                        console.log("ERROR, PROCESSING EVENTS INDIVIDUALLY")
                        for(const nostr_event of nostr_events) {
                            try {
                                await sql`insert into normalized_nostr_events_t ${sql([nostr_event])} ON CONFLICT DO NOTHING;`
                            } catch (error) {
                                console.log("DOUBLE_ERROR")
                                console.log(JSON.stringify(nostr_event))
                                console.log(error)
                            }
                        }
                    }
                }
                console.log('Read entire file.')
            })
        );
}

const args = process.argv.slice(2);
console.log('User arguments:', args);
load_nosdump_file(args[0], 1000)
