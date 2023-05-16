const fetch = require("node-fetch")

// purge cache on production deploy
console.log({vercel: process.env.VERCEL, branch: process.env.VERCEL_GIT_COMMIT_REF, token: process.env.CLOUDFLARE_KEY, zone: process.env.CLOUDFLARE_ZONE})
if (process.env.VERCEL && ["next", "production"].find(_ => _ === process.env.VERCEL_GIT_COMMIT_REF)) {

    fetch(`https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE}/purge_cache`,
     {body: JSON.stringify({purge_everything: true}), headers: [["Authorization", `Bearer ${process.env.CLOUDFLARE_KEY}`],["Content-Type", "application/json"]], method: "POST"})
        .then(r => r.text()).then(r => console.log("cache cleared:", r)).catch(e => console.log("cache clear failed", e.message, e))
}
