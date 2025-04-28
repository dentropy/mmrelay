import { spawn } from 'node:child_process';

// https://stackoverflow.com/questions/14332721/node-js-spawn-child-process-and-get-terminal-output-live
export default async function passthru(exe, args, options) {
    return new Promise((resolve, reject) => {
        let result = ""
        const env = Object.create(process.env);
        const child = spawn(exe, args, {
            ...options,
            env: {
                ...env,
                ...options.env,
            },
        });
        child.stdout.setEncoding('utf8');
        child.stderr.setEncoding('utf8');
        child.stdout.on('data', data => result += data);
        child.stderr.on('data', data => console.log(data));
        child.on('error', error => reject(error));
        child.on('close', exitCode => {
            console.log('Exit code:', exitCode);
            resolve(result)
            // resolve(exitCode);
        });
    });
}

// // let filepath = `nosdump-ingest2.js`
let filepath = "/home/dentropy/Downloads/Nostr/damus-relay-2025-04-24.json"


// const command = `wc -l ${filepath}`
// console.log("Running Command:")
// console.log(command)
// console.log("")
// let line_count = await passthru(command, { shell: true }, {})
// console.log(line_count)
// console.log(line_count)
// line_count = line_count.split(" ")
// line_count = Number(line_count[0])

let line_count = 46338991
console.log(`line_count = ${line_count}`)

for (let i = 0; i < line_count; i += 1000) {
    console.log(i)
    let get_lines_command = `sed -n "${i},${i + 1000}p" "${filepath}"`
    console.log(get_lines_command)
    let lines_from_file = await passthru(get_lines_command, { shell: true, stdio: 'pipe' }, {})
    console.log(lines_from_file)
}