// db.js
import postgres from 'postgres'

// const sql = postgres(process.env.PG_CONN_STRING, {
//     host: process.env.PGHOST,
//     port: process.env.PGPORT,
//     database: process.env.PGDATABASE,
//     username: process.env.PGUSERNAME,
//     password: process.env.PGUSERNAME,
//     ssl: false
// })

const sql = postgres(process.env.PG_CONN_STRING)


export default sql