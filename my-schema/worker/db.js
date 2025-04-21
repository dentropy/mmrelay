// db.js
import postgres from 'postgres'

// console.log(process.env.PG_CONN_STRING)

// const sql = postgres(process.env.PG_CONN_STRING, {
//     host: process.env.PGHOST,
//     port: process.env.PGPORT,
//     database: process.env.PGDATABASE,
//     username: process.env.PGUSERNAME,
//     password: process.env.PGUSERNAME,
//     ssl: { rejectUnauthorized: false } 
// })

const sql = await postgres(
    process.env.PG_CONN_STRING, {
    ssl: { rejectUnauthorized: false } 
})

// let result = await sql`SELECT NOW() as now;`
// console.log(result)

export default sql