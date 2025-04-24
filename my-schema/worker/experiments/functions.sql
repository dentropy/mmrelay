-- Implimenmt Nostr Event Insert in Nostr Javascript First

create function save_nostr_event
    -- Check if event exists
    -- Insert Event when it does not exist
    -- Loop Through Tags
      -- Check regex of first_tag to see if is two characters via Regex
        -- Insert event into appropriate table