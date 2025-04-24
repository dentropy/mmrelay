import { nostrGet } from './lib/nostrGet.js';


const result = await nostrGet(["wss://relay.primal.net"], {"ids": ["601ca9541eaaa842466d09ad1cf019c727d6bd98beb3468283c8777dc875e0f6"], "limit": 1000})

console.log(JSON.stringify(result, null, 2))
console.log(`We got ${result.length} events`)