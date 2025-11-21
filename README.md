# Personal Portfolio (GitHub Pages)

A minimal, fast portfolio for **Ben** (Economics × Data Science × GIS).

## Quick Start

1) Create a new repo on GitHub named **USERNAME.github.io** (replace USERNAME with your GitHub handle).  
2) Download this folder as a ZIP, unzip it, and push the contents to that repo's root.  
3) GitHub Pages will auto-publish at `https://USERNAME.github.io`. If not, go to **Settings → Pages** and set **Source: GitHub Actions** (or **Deploy from a branch** on `main` root).

## Customize

- **index.html**
  - Update social links (`LinkedIn`, `GitHub`), email, and project links.
  - Update About, Skills, Projects, and Experience content.
  - Replace `assets/og-image.png` and `assets/logo.svg` with your own.
  - Add your Google Analytics ID if you use it.

- **resume/Ben-Resume.pdf**
  - Replace with your actual PDF resume file (same name) so the buttons work.

- **css/styles.css**
  - Tweak theme colors in the `:root` variables.

- **assets/favicon.svg**
  - Replace with your own SVG or `.ico`.

## Local Preview

You can open `index.html` directly in a browser. For a local server:
```bash
python3 -m http.server 5173
# then open http://localhost:5173
```

## SEO Tips
- Keep the `<meta name="description">` accurate.
- Use meaningful headings and alt text.
- Link to detailed case studies (GitHub repos, notebooks, dashboards).

## LinkedIn
Add your site to your LinkedIn profile: **Profile → Add website**. Use the "Portfolio" or "Personal Website" category.

© 2025 Ben
