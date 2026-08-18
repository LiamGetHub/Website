# liam-fitting-website

A 5-page static site (Home, Projects, Experience, About, Contact) — no build step, no dependencies. Just HTML/CSS/JS.

## Preview locally
Open `index.html` in a browser, or run a local server from this folder:
```
python3 -m http.server 8000
```
then visit `http://localhost:8000`.

## Deploy (free, ~2 minutes) — pick one

**Netlify (easiest)**
1. Go to app.netlify.com/drop
2. Drag this whole folder onto the page
3. You get a live URL immediately; add a custom domain under Site settings if you have one

**GitHub Pages**
1. Create a new GitHub repo, e.g. `liam-fitting-website`
2. Push these files to the `main` branch
3. In the repo: Settings → Pages → Source: `main` branch, `/root`
4. Site goes live at `https://<your-username>.github.io/liam-fitting-website`

**Vercel**
1. `npm i -g vercel` then run `vercel` from this folder, or drag the folder into vercel.com/new
2. Follow the prompts — no config needed, it's static

## Editing content
- Text lives directly in each `.html` file — search for the section you want to change.
- Colors, fonts, spacing all live in `style.css` under the `:root` block at the top.
- The homepage circuit animation is in `script.js` — tweak `LINK_DIST` or `NODE_COUNT_DIVISOR` to make it sparser/denser.

## Still needs from you
- Resume PDF — add it to this folder and link it from the hero button in `index.html` if you want a "Download Resume" button (`<a href="resume.pdf" class="btn btn-ghost">Resume</a>`)
- GitHub links for the two projects, if you want "View Code" links on the Projects page
- A profile photo, if you'd like one on the About page
