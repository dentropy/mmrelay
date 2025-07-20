import postgres from 'postgres'

const sql = await postgres(
    process.env.PG_CONN_STRING, {
    ssl: { rejectUnauthorized: false }
})


let relay_data = await sql`
select distinct(second_tag) as relay
from nostr_event_tags_t
where first_tag = 'd'
and second_tag not in (select relay_url from nostr_relay_metadata_t);
`

console.log(relay_data)

async function fetchWithTimeout(url, timeout = 5000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/nostr+json'
            },
            signal: controller.signal
        });
        clearTimeout(timeoutId); // Clear timeout if request succeeds
        return await response.json();
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('Request timed out after 5 seconds');
        }
        throw error; // Rethrow other errors
    }
}

for (const relay of relay_data) {
    let url = ""
    if (relay.relay.slice(0, 3) == "wss") {
        url = "https" + relay.relay.slice(3)
    } else {
        url = "http" + relay.relay.slice(2)
    }
    try {
        console.log(url)
        let response = await fetchWithTimeout(url)
        console.log(response)
        let insert_data = {
            relay_url: relay.relay,
            http_url: url,
            success: true,
            relay_metadata: response
        }
        await sql`insert into nostr_relay_metadata_t ${sql(insert_data)} ON CONFLICT DO NOTHING;`
    } catch (error) {
        console.log(error)
        let insert_data = {
            relay_url: relay.relay,
            http_url: url,
            success: false,
            error_text: JSON.stringify(error)
        }
        await sql`insert into nostr_relay_metadata_t ${sql(insert_data)} ON CONFLICT DO NOTHING;`
    }
}