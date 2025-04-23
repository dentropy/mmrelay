import { spawn } from 'node:child_process';
import { encode, decode } from '@ipld/dag-json'
import { code } from 'multiformats/codecs/json'
import fs from 'node:fs'
import { CID } from 'multiformats'
import { sha256 } from 'multiformats/hashes/sha2'
// Takes in a Relay and a Filter Output Path

async function nosdump_scrape(relay, filter, output_path) {
    try {
        await fs.mkdirSync(output_path, { recursive: true });
        console.log(`Directory created (or already exists): ${output_path}`);
    } catch (err) {
        console.error(`Directory already created`);
    }
    let output_struct = {
        relay: relay,
        filter: filter
    }
    const encoded = encode(output_struct)
    const hash = await sha256.digest(encoded)
    const cidv1 = CID.create(1, code, hash)
    let metadata_filepath = `${output_path}/metadata-${cidv1}.json`
    console.log("metadata_filepath")
    console.log(metadata_filepath)
    if(!fs.existsSync(metadata_filepath)){
        await fs.writeFileSync(metadata_filepath, JSON.stringify(output_struct));
        const command = 'echo \'' + JSON.stringify(filter) + `' | nosdump ${relay} > ${output_path}/${cidv1}.jsonl`
        console.log(command)
        const scraping_process = spawn(command, { shell: true })
        scraping_process.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
        });
    } else {
        console.log("filter already scraped")
    }
}

nosdump_scrape("wss://relay.mememaps.net", { kinds: [4] }, "./ScrapedData")