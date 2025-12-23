# 📄 PDF REPORT GENERATION GUIDE

**Action 4:** Generate PDF Report with Diagrams  
**File:** `scripts/generate-security-report.ts`  
**Output:** `SECURITY_AUDIT_REPORT_2025.pdf`  
**Time to Create:** ~30 minutes setup + generation

---

## 🚀 QUICK START

### 1. Install Required Package
```bash
npm install --save-dev puppeteer
```

### 2. Generate PDF Report
```bash
# Option A: Using ts-node
npx ts-node scripts/generate-security-report.ts

# Option B: Compile and run
npm run build
node dist/scripts/generate-security-report.js

# Option C: Add to package.json scripts
npm run generate:report
```

### 3. Output
```
✅ PDF Report generated: /path/to/SECURITY_AUDIT_REPORT_2025.pdf
📊 File size: ~500-800 KB
```

### 4. Verify PDF Created
```bash
# Check if file exists and has content
ls -lh SECURITY_AUDIT_REPORT_2025.pdf
# Should show: -rw-r--r--  1 user  staff  600K Jan 23 12:34 SECURITY_AUDIT_REPORT_2025.pdf
```

---

## 📋 PACKAGE.JSON SCRIPT

Add this to your `package.json`:

```json
{
  "scripts": {
    "generate:report": "ts-node scripts/generate-security-report.ts",
    "generate:report:prod": "NODE_ENV=production ts-node scripts/generate-security-report.ts"
  }
}
```

---

## 📄 PDF REPORT CONTENTS

### Page 1: Title Page
- Report title
- Assessment date
- Classification level
- Scope of assessment

### Page 2: Executive Summary
- Key findings
- Statistics (10 vulnerabilities, 3 critical, 70h effort)
- Strengths and positive aspects
- Assessment summary

### Page 3: Risk Assessment Matrix
- Severity distribution (Critical/High/Medium)
- Top 3 priorities
- CVSS scores for each vulnerability
- Impact assessment

### Page 4: All Vulnerabilities
- Complete table of 10 vulnerabilities
- CVSS scores
- Fix time estimates
- Implementation status

### Page 5: Implementation Timeline
- Week 1: Critical vulnerabilities (32h)
- Week 2: High-priority fixes (18h)
- Week 3: Medium-priority + validation (20h)
- Deployment strategy

### Page 6: Recommendations
- Immediate actions
- Medium-term improvements
- Long-term continuous security
- Conclusion

---

## 🎨 CUSTOMIZATION OPTIONS

### Change Colors
Edit these color codes in `generate-security-report.ts`:

```typescript
// Primary color (headers, links)
#667eea  → Change to your brand color

// Accent colors
#764ba2  → Secondary color
#dc3545  → Critical (red)
#fd7e14  → High (orange)
```

### Add Company Logo
```typescript
// Add logo to title page
const logoPath = 'public/logo.png';
const logoBase64 = fs.readFileSync(logoPath).toString('base64');
// Insert in HTML: <img src="data:image/png;base64,${logoBase64}" />
```

### Change Report Title/Date
```typescript
const reportDate = new Date().toLocaleDateString('pt-BR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});
// Use in template: ${reportDate}
```

### Add Custom Content Sections
```typescript
// Add new page to HTML template
<div class="page">
  <h1>Custom Section</h1>
  <p>Your content here...</p>
</div>
```

---

## 🔧 ADVANCED OPTIONS

### Generate Multiple Formats
```typescript
// PDF
await page.pdf({ path: 'report.pdf', format: 'A4' });

// PNG (for web preview)
await page.screenshot({ path: 'report.png', fullPage: true });

// HTML (source)
fs.writeFileSync('report.html', html);
```

### Add Dynamic Data
```typescript
// Read from database or files
const vulns = await prisma.securityAudit.findMany();
const stats = {
  total: vulns.length,
  critical: vulns.filter(v => v.cvss > 8).length,
  // ...
};

// Insert into template using template literals
const dynamicHTML = generateHTMLReport(stats);
```

### Multi-page Header/Footer
```typescript
await page.pdf({
  headerTemplate: '<div style="font-size:10px;">Página <span class="pageNumber"></span> de <span class="totalPages"></span></div>',
  footerTemplate: '<div style="font-size:10px;">Security Audit Report 2025</div>',
  displayHeaderFooter: true,
  margin: { top: '100px', bottom: '100px' }
});
```

---

## 🚨 TROUBLESHOOTING

### Error: "puppeteer: command not found"
```bash
# Install puppeteer globally
npm install -g puppeteer

# Or use locally installed version
npx puppeteer scripts/generate-security-report.ts
```

### Error: "Timeout waiting for selector"
```typescript
// Increase timeout in page.setContent()
await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });
```

### Error: "Sandbox error" (Linux/Docker)
```typescript
// Add to puppeteer.launch()
const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});
```

### PDF is blank or missing content
```typescript
// Add delay before PDF generation
await page.content(); // Wait for content to render
await page.waitForTimeout(1000); // Add 1s delay
await page.pdf({ path: 'report.pdf' });
```

### File too large (>10MB)
```typescript
// Compress images in HTML before generating
// Or use PNG instead of PDF:
await page.screenshot({ path: 'report.png', fullPage: true });
// Then convert PNG to PDF using external tool
```

---

## 📊 EXAMPLE USAGE IN CI/CD

### GitHub Actions Workflow
```yaml
name: Generate Security Report

on:
  workflow_dispatch: # Manual trigger
  schedule:
    - cron: '0 0 * * 0' # Weekly, Sunday midnight

jobs:
  generate-report:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Generate report
        run: npm run generate:report
      
      - name: Upload report
        uses: actions/upload-artifact@v3
        with:
          name: security-reports
          path: SECURITY_AUDIT_REPORT_2025.pdf
      
      - name: Commit report
        run: |
          git add SECURITY_AUDIT_REPORT_2025.pdf
          git commit -m "docs: Update security audit report" || true
          git push
```

---

## 📧 EMAIL DISTRIBUTION

### Send Report via Email
```typescript
// Install: npm install nodemailer
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const info = await transporter.sendMail({
  from: 'security@company.com',
  to: 'stakeholders@company.com',
  subject: 'Security Audit Report - January 2025',
  html: '<p>Please find the attached security audit report.</p>',
  attachments: [{
    filename: 'SECURITY_AUDIT_REPORT_2025.pdf',
    path: './SECURITY_AUDIT_REPORT_2025.pdf'
  }]
});
```

---

## ✅ VALIDATION CHECKLIST

After generating PDF:

- [ ] File exists: `SECURITY_AUDIT_REPORT_2025.pdf`
- [ ] File size: 500KB - 2MB (reasonable)
- [ ] Can open in PDF reader
- [ ] All pages rendered correctly
- [ ] No blank pages
- [ ] Images/diagrams display properly
- [ ] Text is readable
- [ ] Page breaks look good
- [ ] Header/footer visible
- [ ] Date is correct
- [ ] Links are clickable (if applicable)

---

## 🔐 SECURITY NOTES

### Sensitive Information
The generated PDF may contain sensitive security details. 

**Actions to take:**
- [ ] Mark as CONFIDENTIAL
- [ ] Restrict distribution to authorized personnel only
- [ ] Encrypt PDF with password
- [ ] Don't commit to public repositories
- [ ] Store in secure location (AWS S3 + encryption, Azure Blob)

### Encrypt PDF
```bash
# Install ghostscript
# Then encrypt:
gs -q -dNOPAUSE -dBATCH -sDEVICE=pdfwrite -sOwnerPassword=password -sUserPassword=password -sEncryptionR=3 -dEncryptionR=3 -o encrypted.pdf SECURITY_AUDIT_REPORT_2025.pdf
```

---

## 🎯 NEXT STEPS

After generating the PDF:

1. ✅ Review content for accuracy
2. ✅ Share with stakeholders
3. ✅ Use as reference for patch implementation
4. ✅ Include in compliance documentation
5. ✅ Archive for audit trail
6. ➡️ **Proceed to ACTION 2: Automated Security Tests**

---

## 📚 REFERENCES

- [Puppeteer PDF Documentation](https://pptr.dev/#?product=Puppeteer&version=main&show=api-pagepdfprinterpdfformat)
- [PDF Generation Best Practices](https://pdf.js.org/)
- [Responsive HTML to PDF](https://weasyprint.org/)

---

**Generated:** January 23, 2025  
**Script:** `scripts/generate-security-report.ts`  
**Output:** `SECURITY_AUDIT_REPORT_2025.pdf`
