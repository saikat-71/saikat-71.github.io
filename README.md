# Saikat Portfolio

Personal portfolio website for Md Sobahan Hasan Saikat.

## Admin Dashboard

Open `admin.html` on the deployed website to manage portfolio content without editing HTML.

The dashboard supports:
- Projects: add, edit, delete, cover image and report PDF upload
- Skills: add, edit and delete skill groups
- Certificates: add, edit, delete and upload certificate image/PDF
- Professional experience: add, edit, delete and upload company logo
- GitHub publishing directly from the dashboard

### GitHub setup

1. Create a GitHub fine-grained Personal Access Token.
2. Give it access to this repository with **Contents: Read and write** permission.
3. Open `admin.html` and enter the token.
4. Edit your portfolio and click **Publish Changes**.
5. GitHub Pages will rebuild the site automatically.

The dashboard does not save the GitHub token in localStorage; it stays in the current browser session.

## Data

Editable portfolio content is stored in `data/portfolio.json`.


## Latest UI/UX upgrade
- Responsive mobile-first refinements
- Rich project detail pages
- Programming-language proficiency bars
- Certificate preview uses the original uploaded file inside the Preview modal
- Consistent action-button layout for projects and research
- Admin support for project highlights and multiple screenshots
