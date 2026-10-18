# Editing the site

Everything is plain text. Edit a file, save, refresh the browser. Nothing needs to be built.

## Text and content: `index.html`

The page is split into sections, each marked with a comment you can search for:

| Search for | What it is |
|---|---|
| `HERO` | Big headline, intro, "Open to roles" badge, the four stats |
| `TECH MARQUEE` | The two scrolling rows of technologies (each row is listed twice so the loop is seamless, so change both copies) |
| `01 ABOUT` | About paragraph and the three facts under it |
| `02 WORK` | Project cards. Each starts with `<!-- PROJECT: name -->` |
| `03 STACK` | The skill tiles |
| `04 JOURNEY` | Timeline. Copy one `<div class="ev">…</div>` to add a milestone |
| `05 CONTACT` | Email with Copy and Write me buttons, the email composer, links, location |

**Stats in the hero:** the number in `data-count="121"` is what the counter counts up to.

**Add a project:** copy everything from one `<!-- PROJECT: … -->` comment to its closing `</article>`, paste it after, and change the text and links. The slider's arrows, dots and counter update on their own. To change how the slider moves (how small and blurred the side cards are, speed), edit `LOOK` in the work section of `js/main.js`.

**"Open to roles" badges:** search for `Open to roles`. To remove one, delete that element.

## Colors: `css/styles.css`

The top of the file has the color variables. `--or` is the orange used everywhere, `--bg` is the page background, `--ok` is the green dot.

Other spots with their own colors, all commented in the CSS:
- `GLASS + GRADIENT MESH` – the three blurred light blobs behind the page
- `GRID BEAMS` – grid line brightness and the orange cursor-lit grid
- `BORDER BEAM` – the light that travels around the badges and the email box

## Effects

| What | Where | Settings |
|---|---|---|
| 3D particle core | `js/main.js` | Particle count, size and speed near the top. Its orange is set there too |
| Light beams on the grid | `js/grid.js` | `SETTINGS` at the top: how many beams, how often, length, color |
| Cursor spotlight size | `css/styles.css` | `.spot` – the `420px` value |
| Button glow | `css/styles.css` | `BUTTON GLOW` section |

To put the moving border light on another element, add `beam` to its class: `class="something beam"`.

## Command palette: `js/palette.js`

The list of commands is at the top of the file. Each line is:

```js
["Group", "What it says", "icon", "hint on the right", action]
```

The action can be `"#contact"` (scroll to a section), a full URL (opens in a new tab), `"mailto:…"`, or a function.
Icons available: `go`, `box`, `code`, `copy`, `mail`, `file`, `bolt`, `link`.

## Contact composer: `js/contact.js`

The "Write me" button opens a small form. It never sends anything itself: it opens the visitor's own Gmail, Outlook or mail app with your address, their subject and their message already filled in. The starting text of the message and the fallback subject are at the top of the file.

## Resume

Replace `assets/gasser-gadabdelkader-resume.pdf` with a new file of the same name. Keep personal details you don't want public (phone number, personal email) off this copy, because anyone can download it.

## Accessibility and performance

The site respects "reduce motion" in the operating system: animations, the 3D movement and the light beams turn off. Phones get fewer beams and no cursor effects.
