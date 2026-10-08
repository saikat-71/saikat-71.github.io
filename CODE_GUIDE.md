# Code Guide

This document explains the portfolio architecture and the normal maintenance workflow.

## 1. Architecture

The project is a static website. There is no server-side application and no build step.

The main flow is:

```text
Admin Dashboard / direct JSON edit
        ↓
data/portfolio.json
        ↓
portfolio-loader.js + page-specific rendering
        ↓
Public portfolio pages
```

`data/portfolio.json` is the main content source. Shared interface behavior is kept in small vanilla JavaScript files.

## 2. Important Files

### `data/portfolio.json`

Central portfolio content and configuration.

Main collections:

- `projects`
- `research`
- `experience`
- `education`
- `courses`
- `certificates`
- `skills`

Main configuration:

- `site`
- `about`
- `visibility`
- Shared site/contact/SEO settings under `site`

### `data/portfolio-loader.js`

Loads the portfolio JSON and renders shared dynamic collections.

Important responsibilities:

- Skills
- Projects
- Education
- Experience
- Courses
- Certificates
- Research
- Homepage profile content
- Homepage dynamic totals
- Certificate preview modal
- Homepage section visibility

### `site-common.js`

Shared public-site behavior:

- Header and navigation
- Footer
- Theme switching
- Saved theme preference
- Custom cursor on fine pointers
- SEO metadata
- Quick navigation
- Service-worker registration

### `script.js`

Homepage interactions such as:

- Preloader
- Mobile menu behavior
- Scroll effects
- Counters
- Decorative background effects

### `enhancements.js`

Collection-page helpers:

- Search/filter controls
- Image fallback behavior
- Lightbox behavior
- Keyboard/focus enhancements

### `analytics.js`

Local interaction tracking with optional GA4 loading. No external analytics service is contacted unless a valid measurement ID is configured.

### `admin.js`

Browser-based content management.

It reads `portfolio.json` through the GitHub Contents API and publishes updated JSON/assets back to the configured repository.

The GitHub token is held in JavaScript memory only while the dashboard is being used. It is not written to the repository or local storage.

### `sw.js`

Service worker for caching.

- Static assets use cache-first behavior.
- HTML, CSS, JavaScript, and JSON use network-first behavior.
- The cache name is versioned so old caches can be removed during activation.
- An offline page is used when a network request fails and no cached page is available.

## 3. Data Flow

On a public page:

1. The page loads its HTML structure.
2. `site-common.js` initializes theme and shared interface behavior.
3. `portfolio-loader.js` requests `data/portfolio.json`.
4. The loader renders supported collections into their existing containers.
5. A `portfolio:loaded` event is dispatched for other scripts that need the loaded data.

The loader escapes user-controlled text before placing it into generated HTML. This is important because Admin Dashboard content is ultimately rendered in the public browser.

## 4. Homepage Metrics

The homepage Projects, Research, and Experience totals are calculated from the real arrays:

```text
projects.length
research.length
experience.length
```

Do not reintroduce hard-coded values for these totals. Adding or deleting a record through Admin automatically changes the displayed total after the updated JSON is published.

## 5. Site Settings

The Admin Dashboard **Site Settings** tab manages normal shared information without direct JSON editing:

- Display name
- Public URL
- Tagline
- GitHub URL
- LinkedIn URL
- Email
- Phone
- Default SEO title
- Default SEO description

Homepage Projects, Research, and Experience totals remain calculated automatically.

## 6. Homepage Visibility

`visibility` controls the major homepage sections:

- `projects`
- `experience`
- `education`
- `research`
- `certificates`
- `courses`

The Admin Dashboard can change these values without editing HTML.

The shared navigation also respects the relevant visibility settings so hidden homepage sections are not unnecessarily promoted through the generated quick navigation/footer.

## 7. Admin Dashboard

Normal workflow:

1. Connect to the repository.
2. Load the current JSON.
3. Edit a collection.
4. Save the change locally in the dashboard.
5. Review the dashboard state.
6. Publish the change.
7. Allow GitHub Pages time to deploy.
8. Verify the live page.

Supported collection operations include add, edit, delete, and featured-state editing where the collection supports it.

The dashboard also validates the basic connection response and reports common GitHub authorization errors.

## 8. Project and Research Rendering

Projects and research records are stored as arrays in `portfolio.json`.

Each project can contain:

- title
- label
- description
- overview
- problem
- solution
- technologies
- role
- category
- highlights
- repository URL
- report path
- cover image
- featured state
- stable ID

Research records can contain:

- title
- type
- method
- dataset
- models
- status
- abstract
- problem
- gap
- methodology
- results
- tags
- report/presentation paths
- featured state
- stable ID

Keep IDs unique because detail pages use them in query parameters.

## 9. Experience and Previous Works

Experience records support:

- joining date
- end date
- currently-working state
- company
- logo
- description
- tools
- skills
- previous work samples
- featured state
- logo visibility
- previous-work visibility

The public experience page keeps previous works collapsed until the user opens them.

## 10. Certificate System

Certificates are rendered from `certificates`.

A certificate may include:

- title
- provider
- date
- category
- reference
- credential URL
- PDF/image file
- preview image
- featured state

The preview modal prefers the configured preview image. If there is no preview image but the certificate file is a PDF/image, the file itself is used when supported.

## 11. Image and Document Management

Keep public assets under:

- `images/`
- `documents/`

When adding an asset through Admin, use a path that exists in the published repository.

For images:

- Prefer WebP for photographic/project images.
- Use SVG for genuinely vector artwork.
- Use PNG when transparency or lossless quality is needed.
- Keep dimensions appropriate for the display size.
- Provide meaningful alt text through the data model or rendering function.

For documents:

- Use PDF for reports, CVs, and certificates.
- Avoid duplicate documents unless they represent different versions.

## 12. CSS Organization

`style.css` contains public-site styling.

`admin.css` contains dashboard-specific styling.

Avoid adding emergency overrides at the bottom of the stylesheet when the original selector can be corrected directly. Keep media queries grouped near the relevant component when practical.

When changing a component:

1. Find the existing selector.
2. Correct the existing rule first.
3. Add a new override only when it has a clear purpose.
4. Check both light and dark themes.
5. Check mobile and desktop layouts.

## 13. JavaScript Organization

Use small, direct functions.

Preferred pattern:

- Read data.
- Validate that the required DOM element exists.
- Render the component.
- Bind events once.
- Handle failures with a visible fallback state.

Avoid adding a framework, state-management library, or build system for normal portfolio maintenance.

## 14. Theme System

The theme is stored under the `saikat-theme` local-storage key.

The theme bootstrap in the HTML head runs before the main stylesheet to reduce light/dark flashes.

`site-common.js` then applies the saved theme and updates:

- body theme class
- document theme data
- theme-color metadata
- theme toggle state

When adding a new component, test its colors in both themes.

## 15. SEO

Each public page should have:

- meaningful `<title>`
- description
- canonical URL
- Open Graph title/description/image
- appropriate structured data where useful

The sitemap is maintained manually because the site is static.

The Admin Dashboard is intentionally excluded from indexing.

## 16. Service Worker

The cache version in `sw.js` must change when cache behavior or the core asset list changes.

Current strategy:

- Navigation requests: network-first
- HTML/CSS/JS/JSON: network-first
- Other same-origin assets: cache-first with network fallback
- Offline fallback: `offline.html`

Network-first content is important because Admin Dashboard publishing changes JSON and code without changing a server cache header.

## 17. Security

Never commit:

- GitHub Personal Access Tokens
- API keys
- passwords
- private keys
- OAuth client secrets
- service credentials

The Admin Dashboard intentionally accepts a token at runtime. The token is not stored in `portfolio.json`, source code, or local storage.

A static GitHub Pages site cannot hide a credential that is delivered to browser JavaScript. Use a fine-grained token with the smallest practical repository permission and rotate/revoke it when appropriate.

## 18. Troubleshooting

### Content does not appear

- Confirm `data/portfolio.json` is valid JSON.
- Confirm the browser can request the JSON file.
- Confirm the item is present in the expected array.
- Check the browser console.
- Check that the page contains the expected rendering container.

### An image is broken

- Check the path in `portfolio.json`.
- Confirm the file exists in the repository.
- Use a repository-relative path such as `images/projects/example.webp`.

### The live site shows an older version

- Wait for GitHub Pages deployment to complete.
- Hard-refresh once.
- The service worker uses network-first behavior for site code and content, so persistent stale HTML should not be expected after the updated service worker activates.

### Admin cannot publish

- Confirm the repository name and owner.
- Confirm the token is valid.
- Confirm the token has repository Contents read/write permission.
- Confirm the repository branch is writable.
- Reconnect and retry if the repository changed while the dashboard was open.

### Certificate preview is blank

- Confirm the preview image or certificate file exists.
- Confirm the path is correct.
- If using a PDF, use the **Open PDF** action as the browser's PDF viewer can differ between browsers.

## 19. Release Checklist

Before a public release:

1. Validate `portfolio.json`.
2. Run JavaScript syntax checks.
3. Verify local asset references.
4. Verify project/research/certificate/experience detail links.
5. Test dark and light themes.
6. Test mobile navigation.
7. Test certificate preview.
8. Test Admin connection without publishing unnecessary changes.
9. Check the browser console for errors.
10. Review `robots.txt` and `sitemap.xml`.
11. Confirm no credentials are present.
12. Confirm the service-worker cache version is current.
13. Publish through GitHub Pages.
14. Verify the live URL on desktop and mobile.

## 20. Adding New Functionality

New functionality should be implemented only when the existing data model and dashboard cannot reasonably support the requirement.

Keep the project simple:

- HTML
- CSS
- vanilla JavaScript
- JSON

A new framework or build system should not be introduced for routine portfolio content management.
