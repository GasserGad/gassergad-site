# Deploying

The site is static files, so any web server or static host works.

## On a VPS with Caddy (how gassergad.com runs)

1. Clone the repo onto the server, for example into `/srv/gassergad-site`:
   ```bash
   sudo git clone https://github.com/GasserGad/gassergad-site.git /srv/gassergad-site
   ```
2. Add a site block to your Caddyfile. `deploy/Caddyfile.example` is a template. Replace the placeholder ports with the ports your apps listen on.
3. Reload Caddy:
   ```bash
   sudo systemctl reload caddy
   ```
4. Point DNS for the domain (and `www`) at the server. Caddy gets the HTTPS certificate on its own.

## Updating the live site

```bash
cd /srv/gassergad-site && sudo git pull
```

No restart is needed, because Caddy serves the new files straight away.

## The live status dots

The project cards call `/status/compenstation` and `/status/h2h` on the same domain. The Caddy template forwards those paths to each app's `/healthz` endpoint. On a host without those routes, the dots just say "live demo".
