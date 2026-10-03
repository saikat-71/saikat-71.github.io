# Saikat Personal Portfolio

A responsive personal portfolio for **Md Sobahan Hasan Saikat**, built with HTML, CSS and JavaScript and designed for GitHub Pages.

## Included features

- Responsive portfolio homepage with hero, About, Skills, Projects, Experience, Research and Contact sections.
- Persistent Dark / Light theme.
- Resilient custom cursor with native-cursor fallback.
- Scroll progress, back-to-top control and floating quick navigation.
- Project, certificate, research and GitHub search/filter controls.
- Certificate preview modal with PDF fallback and support for future certificates loaded from `data/portfolio.json`.
- Experience gallery lightbox.
- Dynamic content loading from `data/portfolio.json`.
- Project / research detail pages.
- Live public GitHub repository page.
- Admin dashboard with GitHub Personal Access Token publishing.
- Admin CRUD for About, Projects, Skills, Certificates, Experience, Education and Research.
- Certificate metadata fields: date, category, credential ID and credential URL.
- File upload support from the Admin dashboard.
- Mobile-friendly layout and keyboard focus improvements.

## GitHub Pages deployment

1. Open your repository: `saikat-71/saikat-71.github.io`.
2. Put the contents of the `saikat-71.github.io-main` folder in the repository root.
3. Commit and push the changes.
4. In GitHub, open **Settings → Pages**.
5. Select **Deploy from a branch**, choose `main` and `/ (root)`.
6. Open the GitHub Pages URL after the deployment finishes.

## Admin dashboard

Open `admin.html` from the deployed portfolio. Enter a GitHub fine-grained Personal Access Token with **Contents: Read and write** access to the repository.

The token is kept only in the current browser session and is not written to `portfolio.json` or localStorage.

### Adding a certificate

Admin → Certificates → **Add Certificate**. You can enter the title, provider, date/year, category, credential ID, credential URL and certificate file. Publish the changes and the Certificates page will load the new item automatically from `data/portfolio.json`.

## Important

For the cleanest GitHub Pages deployment, serve the site from GitHub Pages rather than opening HTML files with `file://`. Local fallback data is included for key dynamic pages, but browser security rules can prevent `fetch()` from reading JSON when a page is opened directly from the filesystem.

## Latest update — Search/Filter + Mobile/Admin Polish

- All Projects page now reliably renders all portfolio projects with an embedded fallback and live `portfolio.json` loading.
- Project category filter now uses only project categories: Software Development, Data Analytics, and Machine Learning (plus future admin-added categories).
- Education, Research, and Certificates pages use search-only controls with no category filter.
- Research All page has a search bar without category filtering.
- Home page intentionally has no search bar.
- Admin dashboard now has mobile-friendly tabs, per-section search, quick Add actions, unsaved-change indicator, and a show/hide GitHub token button.
- Project editor category is preserved for future projects; new categories automatically appear in the All Projects filter.
