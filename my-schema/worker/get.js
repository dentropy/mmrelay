import { nostrGet } from './lib/nostrGet.js';


const result = await nostrGet(["wss://relay.primal.net"], {"kinds": [1], "limit": 1000})

console.log(result.length)