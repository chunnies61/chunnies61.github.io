# Analytics

Google Analytics 4 (`G-Z653Z8YTVL`) loads from `index.html`, only on yichuns.com, so local
previews aren't counted. Events go through `track()` in `src/analytics.js`.

This file lives in the repo only; it isn't part of the published site.

## Tagged links

Use these instead of the bare address so each place you share the site shows up as its own
source in **Reports → Acquisition → Traffic acquisition** (switch the first column to
*Session source / medium*, or *Session campaign* for per-company links).

Keep the tags lowercase and spelled the same every time: `LinkedIn` and `linkedin` are two
different rows.

| Where | Link |
|---|---|
| CV (the link inside the PDF) | `https://yichuns.com/?utm_source=resume&utm_medium=pdf` |
| LinkedIn profile (Website field / Featured) | `https://yichuns.com/?utm_source=linkedin&utm_medium=profile` |
| LinkedIn posts | `https://yichuns.com/?utm_source=linkedin&utm_medium=post` |
| LinkedIn messages | `https://yichuns.com/?utm_source=linkedin&utm_medium=message` |
| Job application (one per company) | `https://yichuns.com/?utm_source=application&utm_medium=job_application&utm_campaign=company-name` |
| Email signature / outreach | `https://yichuns.com/?utm_source=email&utm_medium=outreach` |

For `utm_campaign`, use the company name in lowercase with hyphens, e.g. `acme-corp`.

The same tags work after any page's address, e.g. to link straight to one case study:

```
https://yichuns.com/case-studies/lending-solutions-redesign?utm_source=application&utm_medium=job_application&utm_campaign=company-name
```

Deep links keep their tags through the GitHub Pages redirect (`public/404.html` → `index.html`).

## Page titles

`src/components/PageTitle.jsx` gives every page its own title (e.g. "Agent Desk · Yichun Liu"),
so **Reports → Engagement → Pages and screens** splits views per page. Views from before this
change all sit under "Yichun Liu - Staff Product Designer"; switch that report's first column to
*Page path* to split them.

## Events

| Event | When | Parameters |
|---|---|---|
| `select_case_study` | A case study card on the home page, or Previous / Up next | `case_study`, `from` (`home`, `previous`, `up next`) |
| `case_study_section_view` | Once per visit, when a case study section reaches the middle of the screen | `case_study`, `section`, `section_number` |
| `case_study_nav_click` | A click in a case study's side index | `case_study`, `section` |
| `side_project_open` | A Side projects card on the home page (opens its pop-up) | `project` |
| `side_project_link` | "View project website" / "View on Red Dot", in the pop-up or on the Side projects page | `project`, `link` (`website`, `red dot`), `from` (`home pop-up`, `side projects page`) |
| `contact_click` | Email / LinkedIn buttons at the foot of every page | `method` (`email`, `linkedin`), `page` |
| `cv_open` | CV link in the nav | `page` |

To report on a parameter, register it once under **Admin → Custom definitions → Create custom
dimension** (scope: Event): `case_study`, `section`, `section_number`, `project`, `link`,
`from`, `method`, `page`. Event totals show in **Reports → Engagement → Events** without that step.

## Excluding your own visits

**Admin → Data streams → (web stream) → Configure tag settings → Define internal traffic**: add
your IP, then turn the filter on under **Admin → Data filters**.
