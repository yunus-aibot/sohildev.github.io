# Sohil Mansuri — 3D Portfolio

A modern, scroll-driven 3D portfolio built with **Three.js** (WebGL) and vanilla HTML/CSS/JS.
Deployed via GitHub Pages at **[sohildev.github.io](https://sohildev.github.io)**.

## Highlights

- **WebGL hero** — a fresnel-shaded geodesic core with a torus-knot, an additive particle field
  with mouse repulsion, and a scroll-driven camera that morphs between sections.
- **Skill constellation** — 32 technologies mapped onto a rotating fibonacci sphere with
  sprite labels and hover raycasting.
- **Project ring** — nine 3D glass panels orbiting on a canvas-textured ring.
- **Experience helix** — a double-helix line geometry for the career timeline.
- **No build step** — plain ES modules, an import map, and a CSS file. Deploys as-is.

## Structure

```
.
├── index.html              # single-page site
├── 404.html                # styled 404 page
├── .nojekyll               # lets GitHub Pages serve /assets as-is
└── assets
    ├── css/style.css       # design system + layout
    ├── js/three-scene.js   # WebGL scene (ES module, Three.js r169)
    ├── js/main.js          # UI: preloader, cursor, nav, reveal, form
    ├── img/photo.jpg       # portrait
    ├── img/favicon.svg     # hexagon mark
    └── resume/Sohil-Mansuri-Resume.pdf
```

## Local preview

```bash
python -m http.server 8099
# open http://127.0.0.1:8099
```

A server (rather than `file://`) is required because the site loads Three.js as an ES module.

## Notes

- WebGL is optional — if it is unavailable the canvas is hidden and the site degrades to a
  clean static layout.
- `prefers-reduced-motion` is respected: the 3D renders a single static frame and all
  transitions are disabled.
- The contact form validates inline and hands off to the visitor's mail client via `mailto:`.

## Contact

**Sohil Mansuri** — Senior Full Stack Engineer · Software Analyst · Tech Lead
[lislife462@gmail.com](mailto:lislife462@gmail.com) · [+91 72029 65263](tel:+917202965263)
[LinkedIn](https://www.linkedin.com/in/sohil-mansuri-28b2ab184/) · [GitHub](https://github.com/sohildev)

---

© Sohil Mansuri. *"First, solve the problem. Then, write the code."*
