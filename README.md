# gassergad.com

My personal site. It's a single static page: plain HTML, CSS and JavaScript with no build step, no framework and no server code.

**Live:** https://gassergad.com

## What's on it

- A 3D particle core (Three.js) that changes shape as you scroll
- Scroll animations and a project slider with arrows, swipe and arrow keys (GSAP + ScrollTrigger)
- Smooth scrolling (Lenis)
- A faint grid behind the page with light pulses running along it
- Frosted glass panels over drifting gradient light
- A command palette: press `Ctrl K` (or `⌘ K` on a Mac)
- Live "is it up?" checks for my two deployed apps

## Run it locally

Any static file server works. With Node installed:

```bash
npx serve .
```

Then open the address it prints. Opening `index.html` straight from the file system also works, except the live status checks.

## Folder layout

```
index.html        all the page content, split into marked sections
css/styles.css    all the styling (colors are at the top)
js/main.js        3D core, scroll animations, counters, cursor
js/grid.js        background grid, light beams, cursor spotlight, button glow
js/palette.js     the Ctrl K command palette and its list of commands
vendor/           Three.js, GSAP, ScrollTrigger and Lenis (self-hosted)
fonts/            Geist, Geist Mono and IBM Plex Sans Arabic (with licenses)
assets/           resume PDF
deploy/           example web server config
```

See [EDITING.md](EDITING.md) for how to change things, [DEPLOY.md](DEPLOY.md) for hosting, and [CREDITS.md](CREDITS.md) for the libraries and fonts used.

## License

The code and content are © Gasser Gadabdelkader, all rights reserved. You're welcome to read the code and learn from it, but please don't republish the site as your own. Third-party libraries and fonts keep their own licenses (see CREDITS.md).
