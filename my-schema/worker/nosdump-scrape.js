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
    if(!fs.existsSync(metadata_filepath)){
        await fs.writeFileSync(JSON.stringify(output_struct));
        const command = 'echo \'' + JSON.stringify(filter) + `' | nosdump ${relay} > ${output_path}/${cidv1}.jsonl`
        console.log(command)
        spawn(command, { shell: true })
    } else {
        console.log("filter already scraped")
    }
}

nosdump_scrape("wss://relay.mememaps.net", { kinds: [1] }, "./ScrapedData")