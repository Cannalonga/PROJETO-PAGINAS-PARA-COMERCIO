// lib/__tests__/seo-engine.test.ts
/**
 * SEO Engine Tests
 *
 * Comprehensive tests for SEO metadata generation:
 * 1. Tenant defaults + page overrides merging
 * 2. Title suffix concatenation
 * 3. Description fallback chain
 * 4. noindex/nofollow behavior
 * 5. OG tags generation
 * 6. Twitter Card tags
 * 7. Canonical URL
 * 8. Error page metadata
 * 9. Truncation helpers
 * 10. JSON-LD LocalBusiness
 */

import { describe, it, expect } from "@jest/globals";
import {
  buildSeoForPage,
  buildSeoForErrorPage,
  getTruncatedTitle,
  getTruncatedDescription,
  buildJsonLdLocalBusiness,
} from "@/lib/seo/seo-engine";
import type { BuildSeoParams } from "@/types/seo";

describe("buildSeoForPage", () => {
  // 1. Basic metadata generation
  it("should generate basic metadata with all fields", () => {
    const params: BuildSeoParams = {
      tenantDefaults: {
        siteName: "My Store",
        defaultTitleSuffix: " - My Store",
        defaultDescription: "Find everything at My Store",
      },
      page: {
        title: "Home",
        slug: "home",
        seoTitle: "Welcome to Our Store",
        seoDescription: "Discover our products and services",
        seoNoIndex: false,
        seoImage: "https://example.com/og.jpg",
      },
      baseUrl: "https://app.example.com/t/my-store/home",
    };

    const metadata = buildSeoForPage(params);

    expect(metadata.title).toBe("Welcome to Our Store - My Store");
    expect(metadata.description).toBe("Discover our products and services");
    expect(metadata.alternates?.canonical).toBe(
      "https://app.example.com/t/my-store/home"
    );
  });

  // 2. Title suffix concatenation
  it("should append title suffix from tenant defaults", () => {
    const params: BuildSeoParams = {
      tenantDefaults: {
        siteName: "Shop",
        defaultTitleSuffix: " | Shop",
      },
      page: {
        title: "About Us",
        slug: "about",
        seoTitle: "Our Story",
        seoNoIndex: false,
      },
      baseUrl: "https://example.com/t/shop/about",
    };

    const metadata = buildSeoForPage(params);
    expect(metadata.title).toBe("Our Story | Shop");
  });

  // 3. Fallback to page title if no seoTitle
  it("should use page title if seoTitle not provided", () => {
    const params: BuildSeoParams = {
      tenantDefaults: {
        siteName: "Store",
        defaultTitleSuffix: " - Store",
      },
      page: {
        title: "Products",
        slug: "products",
        seoTitle: null,
        seoNoIndex: false,
      },
      baseUrl: "https://example.com/t/store/products",
    };

    const metadata = buildSeoForPage(params);
    expect(metadata.title).toBe("Products - Store");
  });

  // 4. Description fallback chain
  it("should fallback to tenant default description", () => {
    const params: BuildSeoParams = {
      tenantDefaults: {
        siteName: "Store",
        defaultDescription: "Shop at Store",
      },
      page: {
        title: "Products",
        slug: "products",
        seoDescription: null,
        seoNoIndex: false,
      },
      baseUrl: "https://example.com/t/store/products",
    };

    const metadata = buildSeoForPage(params);
    expect(metadata.description).toBe("Shop at Store");
  });

  // 5. noindex behavior - should index
  it("should set index:true when seoNoIndex is false", () => {
    const params: BuildSeoParams = {
      tenantDefaults: { siteName: "Store" },
      page: {
        title: "Page",
        slug: "page",
        seoNoIndex: false,
      },
      baseUrl: "https://example.com/page",
    };

    const metadata = buildSeoForPage(params);
    expect(metadata.robots).toEqual({
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    });
  });

  // 6. noindex behavior - should NOT index
  it("should set index:false when seoNoIndex is true", () => {
    const params: BuildSeoParams = {
      tenantDefaults: { siteName: "Store" },
      page: {
        title: "Secret Page",
        slug: "secret",
        seoNoIndex: true,
      },
      baseUrl: "https://example.com/secret",
    };

    const metadata = buildSeoForPage(params);
    expect(metadata.robots).toEqual({
      index: false,
      follow: false,
      googleBot: { index: false, follow: false },
    });
  });

  // 7. OG tags generation
  it("should generate Open Graph tags", () => {
    const params: BuildSeoParams = {
      tenantDefaults: {
        siteName: "Store",
        defaultTitleSuffix: " - Store",
      },
      page: {
        title: "Products",
        slug: "products",
        seoTitle: "Our Products",
        seoDescription: "Browse all products",
        seoImage: "https://example.com/og.jpg",
        seoNoIndex: false,
      },
      baseUrl: "https://example.com/products",
    };

    const metadata = buildSeoForPage(params);
    expect(metadata.openGraph).toEqual({
      title: "Our Products - Store",
      description: "Browse all products",
      url: "https://example.com/products",
      siteName: "Store",
      type: "website",
      locale: "pt_BR",
      images: [
        {
          url: "https://example.com/og.jpg",
          width: 1200,
          height: 630,
          alt: "Our Products",
        },
      ],
    });
  });

  // 8. Twitter Card tags
  it("should generate Twitter Card tags", () => {
    const params: BuildSeoParams = {
      tenantDefaults: { siteName: "Store" },
      page: {
        title: "Page",
        slug: "page",
        seoTitle: "Page Title",
        seoDescription: "Page description",
        seoImage: "https://example.com/image.jpg",
        seoNoIndex: false,
      },
      baseUrl: "https://example.com/page",
    };

    const metadata = buildSeoForPage(params);
    expect(metadata.twitter).toBeDefined();
    // Twitter metadata is a TwitterMetadata object, not TwitterCard
    expect(metadata.twitter?.title).toBe("Page Title");
    expect(metadata.twitter?.description).toBe("Page description");
  });

  // 9. No image handling
  it("should handle missing OG image", () => {
    const params: BuildSeoParams = {
      tenantDefaults: { siteName: "Store" },
      page: {
        title: "Page",
        slug: "page",
        seoNoIndex: false,
      },
      baseUrl: "https://example.com/page",
    };

    const metadata = buildSeoForPage(params);
    expect(metadata.openGraph?.images).toBeUndefined();
    // Use 'images' instead of 'image' for Twitter metadata
    expect(metadata.twitter?.images).toBeUndefined();
  });

  // 10. Canonical URL
  it("should set canonical URL", () => {
    const baseUrl = "https://example.com/t/store/page";
    const params: BuildSeoParams = {
      tenantDefaults: { siteName: "Store" },
      page: {
        title: "Page",
        slug: "page",
        seoNoIndex: false,
      },
      baseUrl,
    };

    const metadata = buildSeoForPage(params);
    expect(metadata.alternates?.canonical).toBe(baseUrl);
  });
});

describe("buildSeoForErrorPage", () => {
  // Error pages should always be noindex
  it("should generate noindex metadata for error pages", () => {
    const metadata = buildSeoForErrorPage(404, "Page not found");

    expect(metadata.title).toBe("Erro 404");
    expect(metadata.description).toBe("Page not found");
    expect(metadata.robots).toEqual({
      index: false,
      follow: false,
    });
  });

  // 500 error
  it("should handle 500 error", () => {
    const metadata = buildSeoForErrorPage(500, "Server error");
    expect(metadata.title).toBe("Erro 500");
  });
});

describe("getTruncatedTitle", () => {
  // Title under limit
  it("should not truncate short titles", () => {
    expect(getTruncatedTitle("Short Title")).toBe("Short Title");
  });

  // Title over limit
  it("should truncate long titles", () => {
    const longTitle = "This is a very long title that definitely exceeds sixty characters in length";
    const truncated = getTruncatedTitle(longTitle);
    expect(truncated.length).toBeLessThanOrEqual(60);
    // Verify truncation happened
    expect(truncated.length).toBeLessThan(longTitle.length);
  });

  // Exactly 60 chars
  it("should handle exactly 60 character titles", () => {
    const title = "a".repeat(60);
    expect(getTruncatedTitle(title)).toBe(title);
  });
});

describe("getTruncatedDescription", () => {
  // Description under limit
  it("should not truncate short descriptions", () => {
    expect(getTruncatedDescription("Short description")).toBe(
      "Short description"
    );
  });

  // Description over limit
  it("should truncate long descriptions", () => {
    const longDesc =
      "This is a very long description that absolutely exceeds one hundred and sixty characters in length and should definitely be truncated by the getTruncatedDescription function";
    const truncated = getTruncatedDescription(longDesc);
    expect(truncated.length).toBeLessThanOrEqual(160);
    // Verify truncation happened
    expect(truncated.length).toBeLessThan(longDesc.length);
  });

  // Exactly 160 chars
  it("should handle exactly 160 character descriptions", () => {
    const desc = "a".repeat(160);
    expect(getTruncatedDescription(desc)).toBe(desc);
  });
});

describe("buildJsonLdLocalBusiness", () => {
  it("should generate JSON-LD for LocalBusiness", () => {
    const jsonLd = buildJsonLdLocalBusiness({
      name: "My Store",
      address: "123 Main St",
      city: "São Paulo",
      phone: "(11) 9999-9999",
      email: "contact@store.com",
    });

    expect(jsonLd["@context"]).toBe("https://schema.org");
    expect(jsonLd["@type"]).toBe("LocalBusiness");
    expect(jsonLd.name).toBe("My Store");
    expect(jsonLd.telephone).toBe("(11) 9999-9999");
  });

  it("should handle optional fields", () => {
    const jsonLd = buildJsonLdLocalBusiness({ name: "Store" });

    expect(jsonLd.name).toBe("Store");
    expect(jsonLd.address).toBeUndefined();
    expect(jsonLd.telephone).toBeUndefined();
  });
});

describe("SEO Integration Tests", () => {
  // Multi-tenant SEO isolation
  it("should isolate SEO between tenants", () => {
    const storeSeo: BuildSeoParams = {
      tenantDefaults: {
        siteName: "Store A",
        defaultTitleSuffix: " - Store A",
      },
      page: {
        title: "Home",
        slug: "home",
        seoNoIndex: false,
      },
      baseUrl: "https://example.com/t/store-a/home",
    };

    const shopSeo: BuildSeoParams = {
      tenantDefaults: {
        siteName: "Store B",
        defaultTitleSuffix: " - Store B",
      },
      page: {
        title: "Home",
        slug: "home",
        seoNoIndex: false,
      },
      baseUrl: "https://example.com/t/store-b/home",
    };

    const metadata1 = buildSeoForPage(storeSeo);
    const metadata2 = buildSeoForPage(shopSeo);

    expect(metadata1.title).toBe("Home - Store A");
    expect(metadata2.title).toBe("Home - Store B");
    expect(metadata1.openGraph?.siteName).toBe("Store A");
    expect(metadata2.openGraph?.siteName).toBe("Store B");
  });

  // Full page customization
  it("should apply full page customization", () => {
    const params: BuildSeoParams = {
      tenantDefaults: {
        siteName: "Store",
        defaultTitleSuffix: " - Store",
        defaultDescription: "Default description",
      },
      page: {
        title: "About",
        slug: "about",
        seoTitle: "About Our Company",
        seoDescription: "Learn about our company history and values",
        seoImage: "https://example.com/about.jpg",
        seoNoIndex: false,
      },
      baseUrl: "https://example.com/t/store/about",
    };

    const metadata = buildSeoForPage(params);

    expect(metadata.title).toBe("About Our Company - Store");
    expect(metadata.description).toBe(
      "Learn about our company history and values"
    );
    expect(metadata.openGraph?.title).toBe("About Our Company - Store");
    expect(metadata.openGraph?.images).toBeDefined();
  });
});
