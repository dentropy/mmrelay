import { nostrGet } from './worker/lib/nostrGet.js';


const result = await nostrGet(["wss://relay.primal.net"], {"ids": [
    "601ca9541eaaa842466d09ad1cf019c727d6bd98beb3468283c8777dc875e0f6","bee4a296e6b00bb31782e8a0984e507a603764b0073cbdfa957aa587ba8ba093",
    "1c6c90a3d2a3142e71cb5e6d6de397538e25e147ab440b4b73739d0a7bfbaa4f",
    "a7ff8b3812f0e160e62835b1ce58198f8e4abcc30059c8af0aff5c23f59b8eb9",
    "dd7568d56693cad9fa52ec862322c27fcd16affb225a53ed946a2a392a0ab83f",
    "2b0bd432224abedb8fca6f7811e3e9fd2221b5ec788caf0f45fb1bf8d4bb7af5",
    "1618a1bf31174b7204d114e237b3e8ccbe9455593d210bbc076cbf3d745af7ad",
    "adbf5a62edc33b52491b00d6b1c8ed1c8c77a492d9ad0090bea67df1f172e029",
    "80088f14236ab6233b5fbac46a4d347d0435db3211c23166210318938e1380fa",
    "6aa6804a59d6ee88bf9d344c989f3017689c8c23b359687a8250eb59b9db5566",
    "4b248d28c54efbee771a4d598326970b7e4c06584ce0a6f0bd2363f916294cf4",
    "fe5614bc28890d3b828dba1ab031f797eb0768c546ace5f30e87c9bd4a66fea3"
], "limit": 1000})

console.log(JSON.stringify(result, null, 2))
console.log(`We got ${result.length} events`)
console.log(result.toLocaleString.length)