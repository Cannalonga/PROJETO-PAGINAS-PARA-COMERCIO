# FEATURE 7 BLOCO 2 — QUICK REFERENCE

**Complete API Export List**

---

## 📦 seo-hreflang.ts

```typescript
// Interfaces
export interface HreflangOptions {
  domain: string
  defaultSlug: string
  locales: SeoLocaleVariant[]
}

// Functions
export function buildHreflangTags(options: HreflangOptions): string
export function isValidLocale(locale: string): boolean
export function normalizeLocale(locale: string): string
export function getLanguageCode(locale: string): string
export function groupLocalesByLanguage(locales: SeoLocaleVariant[]): Map<string, SeoLocaleVariant[]>
```

**Usage**:
```typescript
import { buildHreflangTags, isValidLocale, normalizeLocale } from "@/lib/seo/seo-hreflang"

const tags = buildHreflangTags({
  domain: "https://site.com",
  defaultSlug: "page",
  locales: [
    { locale: "pt-BR", isDefault: true }
  ]
})
```

---

## 📦 seo-robots-meta.ts

```typescript
// Interfaces
export interface RobotsConfig {
  isDraft?: boolean
  isNoIndex?: boolean
  allowIndex?: boolean
  allowFollow?: boolean
}

// Types
export type RobotsValue = "index,follow" | "index,nofollow" | "noindex,follow" | "noindex,nofollow"
export type ContentType = "draft" | "archived" | "private" | "published"

// Functions
export function buildRobotsMeta(config: RobotsConfig): string
export function getRobotsValue(config: RobotsConfig): RobotsValue
export function isValidRobotsValue(value: string): boolean
export function parseRobotsMeta(tag: string): Record<string, boolean>
export function getRobotsForRoute(route: string): RobotsValue
export function getRobotsForContentType(type: ContentType): RobotsValue
```

**Usage**:
```typescript
import { buildRobotsMeta, getRobotsValue, getRobotsForRoute } from "@/lib/seo/seo-robots-meta"

// Draft protection
const meta = buildRobotsMeta({ isDraft: true })
// → <meta name="robots" content="noindex,nofollow" />

// Get just the value
const value = getRobotsValue({ isDraft: false })
// → "index,follow"
```

---

## 📦 seo-geotags.ts

```typescript
// Constants
export const COUNTRY_CODES: Record<string, string> = {
  BR: "Brasil",
  US: "Estados Unidos",
  // ... 13 more countries
}

// Functions
export function buildGeoMetaTags(geo?: SeoGeoLocation): string
export function validateGeoLocation(geo: Partial<SeoGeoLocation>): { valid: boolean; errors: string[] }
export function parseCoordinatesString(coordString: string): { latitude: number; longitude: number } | null
export function distanceInKm(lat1: number, lng1: number, lat2: number, lng2: number): number
export function isValidCountryCode(code: string): boolean
export function getCountryName(code: string): string | null
```

**Usage**:
```typescript
import { buildGeoMetaTags, validateGeoLocation, distanceInKm } from "@/lib/seo/seo-geotags"

// Generate geo tags
const tags = buildGeoMetaTags({
  city: "São Paulo",
  region: "SP",
  countryCode: "BR",
  latitude: -23.5505,
  longitude: -46.6333
})

// Validate coordinates
const valid = validateGeoLocation({ latitude: -23.5505, longitude: -46.6333 })

// Calculate distance
const km = distanceInKm(-23.5505, -46.6333, -22.9068, -43.1729)
```

---

## 📦 seo-advanced-tags.ts

```typescript
// Interfaces
export interface AdvancedMetaResult {
  hreflangTags?: string
  robotsMeta?: string
  geoTags?: string
  canonicalUrl?: string
  success: boolean
  warnings: string[]
}

// Functions
export function buildAdvancedMetaTags(input: SeoInput): AdvancedMetaResult
export function integrateAdvancedTags(output: SeoOutput, advanced: AdvancedMetaResult): SeoOutput
export function renderAdvancedTags(advanced: AdvancedMetaResult): string
export function validateAdvancedTags(advanced: AdvancedMetaResult): { isComplete: boolean; missing: string[] }
export function debugAdvancedTags(advanced: AdvancedMetaResult): string
```

**Usage**:
```typescript
import { buildAdvancedMetaTags, integrateAdvancedTags, debugAdvancedTags } from "@/lib/seo/seo-advanced-tags"

// Build all advanced tags
const advanced = buildAdvancedMetaTags({
  domain: "https://site.com",
  slug: "page",
  isDraft: false,
  locales: [...],
  location: {...}
})

// Integrate into SeoOutput
const output = integrateAdvancedTags(seoOutput, advanced)

// Debug
console.log(debugAdvancedTags(advanced))
```

---

## 🔧 types/seo.ts Extensions

```typescript
// NEW INTERFACES
export interface SeoLocaleVariant {
  locale: string           // BCP 47
  slug?: string
  absoluteUrl?: string
  isDefault?: boolean
}

export interface SeoGeoLocation {
  city?: string
  region?: string
  countryCode?: string
  latitude?: number
  longitude?: number
}

// EXTENDED SeoInput
export interface SeoInput {
  // ... existing fields ...
  domain?: string
  locales?: SeoLocaleVariant[]
  location?: SeoGeoLocation
  isNoIndex?: boolean
}

// EXTENDED SeoOutput
export interface SeoOutput {
  // ... existing fields ...
  hreflangTags?: string
  robotsMeta?: string
  geoTags?: string
}
```

---

## 🎯 COMPLETE WORKFLOW

```typescript
import { generateSeo } from "@/lib/seo/seo-engine"

// All BLOCO 2 features integrated automatically
const output = await generateSeo({
  title: "Pizzaria do João",
  description: "Melhor pizza de São Paulo",
  slug: "pizzaria-do-joao",
  domain: "https://pizzarias.com.br",
  isDraft: false,
  
  // BLOCO 2 fields
  locales: [
    { locale: "pt-BR", slug: "pizzaria-do-joao", isDefault: true },
    { locale: "en-US", slug: "joao-pizzeria" }
  ],
  location: {
    city: "São Paulo",
    region: "SP",
    countryCode: "BR",
    latitude: -23.5505,
    longitude: -46.6333
  }
}, {
  domain: "https://pizzarias.com.br"
})

// Now includes:
// - output.hreflangTags (multi-language)
// - output.robotsMeta (draft protection)
// - output.geoTags (geolocation)
// - output.canonicalUrl
```

---

## 📋 VALIDATION FUNCTIONS

### Check Locale Validity
```typescript
isValidLocale("pt-BR")      // true
isValidLocale("xx-YY")      // false
normalizeLocale("PT_BR")    // "pt-BR"
```

### Check Robots Validity
```typescript
isValidRobotsValue("index,follow")      // true
isValidRobotsValue("invalid,values")    // false
```

### Check Coordinates
```typescript
validateGeoLocation({
  latitude: -23.5505,
  longitude: -46.6333
})
// { valid: true, errors: [] }
```

### Check Country Code
```typescript
isValidCountryCode("BR")    // true
getCountryName("BR")        // "Brasil"
```

---

## 🚀 INTEGRATION POINTS

### In Next.js Pages

```typescript
// app/pizzarias/[slug]/page.tsx

import { generateSeo } from "@/lib/seo/seo-engine"

export async function generateMetadata({ params }) {
  const output = await generateSeo({
    // ... input ...
    domain: process.env.NEXT_PUBLIC_DOMAIN
  }, {
    domain: process.env.NEXT_PUBLIC_DOMAIN
  })

  return {
    title: output.canonicalUrl,
    description: "...",
    // BLOCO 2 fields now available!
    alternates: {
      languages: {
        "pt-BR": output.hreflangTags,
        "en": output.hreflangTags
      }
    }
  }
}
```

### In API Routes

```typescript
// app/api/seo/route.ts

import { buildAdvancedMetaTags } from "@/lib/seo/seo-advanced-tags"

export async function POST(request: Request) {
  const input = await request.json()
  
  const advanced = buildAdvancedMetaTags({
    ...input,
    domain: process.env.NEXT_PUBLIC_DOMAIN
  })

  return Response.json({
    hreflangTags: advanced.hreflangTags,
    robotsMeta: advanced.robotsMeta,
    geoTags: advanced.geoTags,
    success: advanced.success,
    warnings: advanced.warnings
  })
}
```

---

## 🧪 TEST EXAMPLES

### Testing Hreflang

```typescript
import { buildHreflangTags } from "@/lib/seo/seo-hreflang"

describe("Hreflang", () => {
  it("should build hreflang tags", () => {
    const tags = buildHreflangTags({
      domain: "https://site.com",
      defaultSlug: "page",
      locales: [
        { locale: "pt-BR", isDefault: true },
        { locale: "en-US" }
      ]
    })
    
    expect(tags).toContain("pt-BR")
    expect(tags).toContain("en-US")
    expect(tags).toContain("x-default")
  })
})
```

### Testing Robots

```typescript
import { buildRobotsMeta } from "@/lib/seo/seo-robots-meta"

describe("Robots", () => {
  it("should protect draft pages", () => {
    const meta = buildRobotsMeta({ isDraft: true })
    expect(meta).toContain("noindex,nofollow")
  })

  it("should index published pages", () => {
    const meta = buildRobotsMeta({ isDraft: false })
    expect(meta).toContain("index,follow")
  })
})
```

### Testing Geolocation

```typescript
import { buildGeoMetaTags, validateGeoLocation } from "@/lib/seo/seo-geotags"

describe("Geolocation", () => {
  it("should build geo tags", () => {
    const tags = buildGeoMetaTags({
      city: "São Paulo",
      latitude: -23.5505,
      longitude: -46.6333
    })
    
    expect(tags).toContain("geo.position")
    expect(tags).toContain("São Paulo")
  })

  it("should validate coordinates", () => {
    const result = validateGeoLocation({
      latitude: -23.5505,
      longitude: -46.6333
    })
    
    expect(result.valid).toBe(true)
  })
})
```

---

## 📊 PERFORMANCE NOTES

### Time Complexity
- `buildHreflangTags`: O(n) where n = number of locales
- `buildRobotsMeta`: O(1)
- `buildGeoMetaTags`: O(1)
- `buildAdvancedMetaTags`: O(n)

### Space Complexity
- All operations: O(1) or O(n) where n = output string length

### Optimization Tips
- Cache buildHreflangTags results for same locale set
- Reuse AdvancedMetaResult across requests
- Validate input once, reuse results

---

## 🔗 DEPENDENCIES

**External**: None (0)

**Internal**:
- `types/seo.ts` — Type definitions
- (seo-hreflang imports none)
- (seo-robots-meta imports none)
- (seo-geotags imports none)
- seo-advanced-tags imports:
  - seo-hreflang
  - seo-robots-meta
  - seo-geotags

---

## 📞 QUICK SUPPORT

### Common Questions

**Q: How do I add multi-language support?**
```typescript
locales: [
  { locale: "pt-BR", slug: "pagina", isDefault: true },
  { locale: "en-US", slug: "page" }
]
```

**Q: How do I protect draft pages?**
```typescript
isDraft: true  // Automatically becomes noindex,nofollow
```

**Q: How do I add geolocation?**
```typescript
location: {
  city: "São Paulo",
  region: "SP",
  countryCode: "BR",
  latitude: -23.5505,
  longitude: -46.6333
}
```

**Q: How do I get just the values?**
```typescript
getRobotsValue({ isDraft: false })  // "index,follow"
```

**Q: How do I validate input?**
```typescript
isValidLocale("pt-BR")
validateGeoLocation(geo)
isValidRobotsValue("index,follow")
```

---

**Status**: ✅ Production Ready  
**Last Updated**: 2025-11-19  
**Questions**: See FEATURE_7_BLOCO_2_INDEX.md for details
