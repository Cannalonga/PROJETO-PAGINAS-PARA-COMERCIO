# 📦 Archive Directory

This directory contains legacy, historical, and reference documentation from project phases that have been completed or superseded.

## 📂 Structure

### 🔷 `/documentation` (21 files)
Technical specifications, feature documentation, and implementation guides for completed BLOCO iterations.

**Key Files:**
- `BLOCO_1_*.md` — Feature BLOCO 1 (Core SEO Engine)
- `BLOCO_2_*.md` — Feature BLOCO 2 (Advanced Meta Tags)
- `FEATURE_6_*.md` — Feature 6 (Prisma + R2 Deploy)
- `DEPLOYMENT.md` — Deployment procedures
- `ARCHITECTURAL_RECOMMENDATIONS.md` — System architecture notes

### 📊 `/reports` (26 files)
Project status reports, phase summaries, and completion checklists.

**Key Files:**
- `PHASE_*.md` — Phase completion reports
- `FASE_*.md` — Portuguese phase documentation
- `SPRINT_*.md` — Sprint reports and reviews
- `SUPERVISOR_REPORT_*.md` — Executive summaries

### 📖 `/guides` (9 files)
Setup, deployment, testing, and integration guides.

**Key Files:**
- `P0_INTEGRATION_GUIDE.md` — Phase 0 integration steps
- `P1_INTEGRATION_GUIDE.md` — Phase 1 integration steps
- `TESTING_ENDPOINTS_GUIDE.md` — API endpoint testing procedures
- `COMMIT_MESSAGE_GUIDE.md` — Git commit message standards

### 🗂️ `/legacy` (53 files)
Deprecated documentation, old configuration files, and historical records.

**Contents:**
- Old sprint checklists and presentation guides
- Legacy configuration files (`tailwind.config.ts`)
- Historical phase notes and quick starts
- Obsolete security and workflow documentation
- Old testing scripts and log files

---

## 🔍 When to Reference Archive Files

**Use archive documentation to:**
- Understand historical architecture decisions
- Review past phase completions
- Reference old integration patterns
- Troubleshoot issues in deprecated code paths
- Find past deployment procedures

**For current work, reference:**
- Root-level `README.md` — Current project state
- `FEATURE_7_BLOCO_*.md` files in root — Active features
- `/app` and `/src` directories — Source code

---

## 📝 Current Active Documentation

The following files in the **root directory** are current and active:

```
├── README.md                              # Current project overview
├── FEATURE_7_BLOCO_2_*.md                 # Advanced Meta Tags (Active)
├── FEATURE_7_BLOCO_3_*.md                 # Advanced JSON-LD (Active)
├── FEATURE_7_BLOCO_4_*.md                 # Dashboard UI (Active)
├── FEATURE_7_BLOCO_5_*.md                 # Sitemap & Robots (Active)
├── next.config.js                         # Next.js configuration
├── tsconfig.json                          # TypeScript configuration
├── package.json                           # Project dependencies
└── jest.config.js                         # Test configuration
```

---

## 🚀 Quick Navigation

| Purpose | Location |
|---------|----------|
| **SEO Features (BLOCO 2-5)** | Root: `FEATURE_7_BLOCO_*.md` |
| **Feature 6 (Deploy)** | Archive: `/documentation/FEATURE_6_*.md` |
| **Setup Instructions** | Archive: `/guides/P*_*.md` |
| **Phase Reports** | Archive: `/reports/PHASE_*.md` |
| **Old Configurations** | Archive: `/legacy/*.config.ts` |
| **API Testing** | Archive: `/guides/TESTING_ENDPOINTS_GUIDE.md` |
| **Integration Steps** | Archive: `/guides/*_INTEGRATION_GUIDE.md` |

---

## ✅ Archive Cleanup Date

- **Created:** 2025-01-15
- **Reason:** Organize root directory by archiving 109 legacy files
- **Impact:** Root directory now contains only essential config, active features, and source code

---

## 🔄 Future Maintenance

When adding new documentation:
1. Keep **active feature docs** in root
2. Move completed sprint docs to `/reports`
3. Move deprecated guides to `/legacy`
4. Keep technical references in `/documentation`

This keeps the root directory clean while preserving project history for reference.
