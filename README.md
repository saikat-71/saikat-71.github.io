# Md Sobahan Hasan Saikat — Portfolio

A responsive, data-driven personal portfolio built with HTML, CSS, and vanilla JavaScript. The site is designed for GitHub Pages and keeps normal portfolio content in a central JSON data source so content can be maintained without editing page markup.

## Features

- Responsive portfolio homepage and collection pages
- Projects, research, experience, education, courses, certifications, and skills
- Dynamic homepage Projects, Research, and Experience totals
- GitHub-based Admin Dashboard for content editing and publishing
- Featured-item controls for homepage collections
- Homepage section visibility controls
- Project and research detail pages
- Certificate preview modal with PDF fallback
- Previous-work gallery for professional experience
- Dark/light theme with saved preference
- Accessible navigation, focus states, labels, and image alt text
- SEO metadata, canonical URLs, Open Graph metadata, sitemap, and robots rules
- Service-worker caching with network-first updates for HTML, CSS, JavaScript, and portfolio data
- Lazy-loaded portfolio imagery and asynchronous image decoding
- Optional privacy-conscious local analytics and optional GA4 integration

## Technology Stack

- HTML5
- CSS3
- Vanilla JavaScript
- JSON
- GitHub REST API for Admin Dashboard publishing
- Font Awesome and Google Fonts via CDN

No frontend framework or build system is required.

## Project Structure

```text
/
├── index.html
├── projects.html
├── project.html
├── research.html
├── experience.html
├── education.html
├── courses.html
├── certificates.html
├── github.html
├── admin.html
├── offline.html
├── style.css
├── admin.css
├── script.js
├── site-common.js
├── enhancements.js
├── analytics.js
├── sw.js
├── data/
│   ├── portfolio.json
│   └── portfolio-loader.js
├── images/
├── documents/
├── site.webmanifest
├── robots.txt
├── sitemap.xml
├── README.md
└── CODE_GUIDE.md
```

## Data and Content Management

`data/portfolio.json` is the central content source for:

- Projects
- Research
- Professional experience
- Education
- Courses
- Certifications
- Skills
- About/profile content
- Homepage section visibility
- Site links and SEO settings

The public pages read this data at runtime. Normal content additions should therefore be made through the Admin Dashboard rather than by editing individual HTML files.

## Admin Workflow

1. Open `admin.html` on the deployed portfolio.
2. Enter the repository owner and repository name.
3. Enter a GitHub fine-grained Personal Access Token with repository Contents read/write permission.
4. Connect and load the current portfolio data.
5. Add, edit, delete, feature, or hide supported content.
6. Save local dashboard changes.
7. Click **Publish Changes**.
8. Wait for GitHub Pages to deploy the new commit.

The token is kept only in the current browser session and is not written into portfolio data, source files, or local storage by the dashboard.

### GitHub Pages security limitation

A static GitHub Pages site cannot keep a GitHub Personal Access Token secret from the browser. The dashboard therefore requires the administrator to provide the token at use time. Never hard-code a token, API key, password, private key, or other credential into this repository.

For stronger operational security, use a dedicated fine-grained token with the smallest practical repository scope and rotate/revoke it when no longer required.

## Deployment

This repository is intended to run from the repository root as a GitHub Pages static site.

Recommended deployment:

1. Push the project files to `saikat-71/saikat-71.github.io`.
2. In GitHub, open **Settings → Pages**.
3. Select the publishing source/branch configured for the repository.
4. Open the published `https://saikat-71.github.io/` address.
5. Verify the homepage, collection pages, assets, and Admin Dashboard.

No build command is required.

## Performance

- Portfolio content is loaded from one JSON source.
- Images use lazy loading where appropriate.
- Images use asynchronous decoding.
- Large project imagery should be compressed before publication.
- The service worker caches static assets and uses network-first behavior for site code and content to reduce stale deployments.

## SEO

The site includes:

- Per-page titles and descriptions
- Canonical URLs
- Open Graph metadata
- Twitter card metadata
- Person/WebPage structured data
- `robots.txt`
- `sitemap.xml`
- Web manifest and favicon support

When the public URL or page structure changes, update the canonical URLs and sitemap.

## Accessibility

The project uses semantic HTML where practical, meaningful image alt text, labeled controls, keyboard-accessible buttons, visible focus states, and modal state attributes.

## Maintenance

For normal content changes, use the Admin Dashboard. Direct JSON editing is appropriate when a change cannot be represented by the current dashboard fields.

Code changes are only normally required for new functionality, new page types, or changes to the data model.

See `CODE_GUIDE.md` for the detailed maintenance and troubleshooting guide.

## Analytics

Local interaction analytics are available without an external analytics service. GA4 is optional and remains inactive while its measurement ID is empty.

If GA4 is enabled, add the measurement ID through the site data configuration and review the privacy requirements applicable to the deployment.

## License / Use Statement

This repository contains personal portfolio content, original project presentation material, and associated documents. Unless a separate license or attribution notice is provided for a specific asset, the portfolio content and visual materials should not be reused or redistributed without permission.
