# FEATURE 7 - BLOCO 4: Quick Reference

**Quick lookup guide for developers**

---

## 📚 Component Imports

```typescript
// Main dashboard
import { SeoDashboard } from '@/components/seo-dashboard';

// Individual components
import { SeoScoreCard } from '@/components/seo-dashboard/SeoScoreCard';
import { SeoWarnings } from '@/components/seo-dashboard/SeoWarnings';
import { SeoGooglePreview } from '@/components/seo-dashboard/SeoGooglePreview';
import { SeoSocialPreview } from '@/components/seo-dashboard/SeoSocialPreview';
```

## 🪝 Hook Imports

```typescript
import { useSeoData } from '@/hooks/useSeoData';
import { useSeoScoreColors, useMetricColor, useProgressBarColor } from '@/hooks/useSeoScoreColors';
import { useThemeToggle, useThemedColor, useThemedClass } from '@/hooks/useThemeToggle';
```

---

## 🎯 Quick Usage

### Basic Dashboard
```typescript
<SeoDashboard pageId="page-123" />
```

### With Options
```typescript
<SeoDashboard 
  pageId="page-123"
  autoRefresh={true}
  autoRefreshInterval={30000}
  onUpdate={() => console.log('Updated')}
/>
```

### Get SEO Data
```typescript
const { data, isLoading, error, refetch } = useSeoData('page-123');

if (isLoading) return <Skeleton />;
if (error) return <Error />;
return <div>{data.score}</div>;
```

### Score Colors
```typescript
const colors = useSeoScoreColors(92);
// Returns: { background, text, badge, progress, gradient, icon, status }
```

### Theme Toggle
```typescript
const { isDark, toggle } = useThemeToggle();
return <button onClick={toggle}>{isDark ? '☀️' : '🌙'}</button>;
```

---

## 🔌 API Endpoints

### GET /api/seo/[pageId]/summary
```bash
curl https://api.example.com/api/seo/page-123/summary
```
Returns: Complete SEO data with score, warnings, OG tags, etc.

### GET /api/seo/[pageId]/preview/google
```bash
curl https://api.example.com/api/seo/page-123/preview/google
```
Returns: SERP preview data with metrics and validation

### GET /api/seo/[pageId]/preview/social
```bash
curl https://api.example.com/api/seo/page-123/preview/social
```
Returns: Social preview data with OG tags and platform-specific data

---

## 🎨 Color Scores

| Score | Color | Emoji | Status |
|-------|-------|-------|--------|
| 80+ | 🟢 Green | ✅ | Excelente |
| 60-79 | 🟡 Yellow | ⚠️ | Bom |
| 40-59 | 🟠 Orange | ⚠️ | Médio |
| <40 | 🔴 Red | ❌ | Precisa Melhorar |

---

## 🖼️ Theme Colors

### Light
```
bg: white (#FFF)
text: slate-900 (#0F172A)
primary: blue-600 (#0066CC)
success: green-600 (#10B981)
warning: amber-600 (#F59E0B)
error: red-600 (#EF4444)
```

### Dark
```
bg: slate-950 (#0F172A)
text: slate-100 (#F1F5F9)
primary: blue-500 (#3B82F6)
success: green-500 (#10B981)
warning: amber-400 (#FBBF24)
error: red-500 (#FF6B6B)
```

---

## 📏 Metric Ranges

### Title
- Ideal: 30-60 characters
- Max display: 60 characters
- Status: ✅ (ideal) | ⚠️ (above max) | ❌ (below min)

### Description
- Ideal: 120-155 characters
- Max display: 155 characters
- Status: ✅ (ideal) | ⚠️ (above max) | ❌ (below min)

### OG Title
- Ideal: 20-90 characters
- Recommended: <90 for all platforms

### OG Description
- Ideal: 20-200 characters
- Recommended: 100-200 for best display

---

## 📡 Cache Headers

All SEO API endpoints use these cache headers:

```
Cache-Control: public, max-age=300, s-maxage=600
```

- **Client cache**: 5 minutes (max-age=300)
- **CDN cache**: 10 minutes (s-maxage=600)
- **Scope**: Public (cacheable for everyone)

### Manual cache clear
```typescript
const { refetch } = useSeoData('page-123');
refetch(); // Clears cache and refetches
```

---

## ⚡ Rate Limiting

All endpoints limit to **60 requests per minute** per IP

```
Rate-Limit-Limit: 60
Rate-Limit-Remaining: 45
Rate-Limit-Reset: 1234567890
```

Response when limit exceeded:
```json
{
  "error": "Rate limit exceeded",
  "status": 429
}
```

---

## 🛠️ TypeScript Types

### SeoDataReturn
```typescript
interface {
  data: any | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<any>;
}
```

### ScoreColorPalette
```typescript
interface {
  background: string;
  text: string;
  badge: string;
  progress: string;
  gradient: string;
  icon: string;
  status: string;
}
```

### ThemeToggleReturn
```typescript
interface {
  theme: 'light' | 'dark';
  isDark: boolean;
  mounted: boolean;
  toggle: () => void;
  setLight: () => void;
  setDark: () => void;
  setSystem: () => void;
  currentThemeSetting: string;
}
```

---

## 🚨 Common Issues

### Dashboard not loading
1. Check `pageId` is valid
2. Verify API endpoint: `GET /api/seo/[pageId]/summary`
3. Check browser console for errors
4. Verify database connection

### Theme not switching
1. Check `ThemeProvider` in `app/layout.tsx`
2. Verify `next-themes` installed
3. Check browser localStorage for `theme` key
4. Verify `darkMode: 'class'` in tailwind.config.js

### Auto-refresh not working
1. Check `autoRefresh` prop is `true`
2. Verify `autoRefreshInterval` > 0
3. Check rate limiting not blocking
4. Verify API responding correctly

### Colors wrong in dark mode
1. Verify `class="dark"` on html element
2. Check Tailwind `darkMode: 'class'` config
3. Verify theme hook returns correct `isDark`
4. Check component uses `isDark` ternary

---

## 📞 Support Resources

- **Full Docs**: See `FEATURE_7_BLOCO_4_INDEX.md`
- **Status Report**: See `FEATURE_7_BLOCO_4_STATUS.md`
- **BLOCO 3 Data**: See `FEATURE_7_BLOCO_3_INDEX.md`
- **SEO Engine**: See `lib/seo-engine.ts`

---

## ✅ Pre-flight Checklist

Before deploying:

- [ ] All components render without errors
- [ ] Theme toggle works in both directions
- [ ] All 5 tabs functional
- [ ] Auto-refresh triggering
- [ ] API endpoints responding
- [ ] Error states displaying
- [ ] No console warnings
- [ ] TypeScript strict mode passing
- [ ] Dark/light mode readable
- [ ] Mobile layout responsive

---

**Last Updated**: Session N  
**Version**: 1.0.0  
**Status**: Production Ready ✅
