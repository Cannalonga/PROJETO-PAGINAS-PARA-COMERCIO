/**
 * Unit Tests for Fase 3 Libraries
 */

import { describe, it, expect } from '@jest/globals';

// Page Editor Tests
import {
  validateSlug,
  generateSlug,
  validatePageBlock,
  addPageBlock,
  removePageBlock,
  updatePageBlock,
  type PageBlock,
} from '@/lib/page-editor';

describe('Page Editor', () => {
  describe('validateSlug', () => {
    it('should validate correct slug format', () => {
      expect(validateSlug('valid-slug')).toBe(true);
      expect(validateSlug('another-valid-slug')).toBe(true);
      expect(validateSlug('slug123')).toBe(true);
    });

    it('should reject invalid slug format', () => {
      expect(validateSlug('Invalid Slug')).toBe(false);
      expect(validateSlug('slug@invalid')).toBe(false);
      expect(validateSlug('')).toBe(false);
    });
  });

  describe('generateSlug', () => {
    it('should generate valid slug from title', () => {
      expect(generateSlug('My Product')).toBe('my-product');
      expect(generateSlug('Hello World!')).toBe('hello-world');
      expect(generateSlug('  Spaces  ')).toBe('spaces');
    });

    it('should handle special characters', () => {
      expect(generateSlug('Product #1')).toBe('product-1');
      expect(generateSlug('Test & Demo')).toBe('test-demo');
    });
  });

  describe('validatePageBlock', () => {
    it('should validate correct block', () => {
      const block: PageBlock = {
        id: 'block-1',
        type: 'heading',
        content: { text: 'Title' },
        order: 0,
      };
      const result = validatePageBlock(block);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid block', () => {
      const block: PageBlock = {
        id: '',
        type: 'heading',
        content: {},
        order: 0,
      };
      const result = validatePageBlock(block);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Page block operations', () => {
    it('should add block to page', () => {
      const blocks: PageBlock[] = [
        { id: '1', type: 'heading', content: {}, order: 0 },
      ];
      const newBlock: PageBlock = { id: '2', type: 'paragraph', content: { text: 'Para' }, order: 1 };
      const result = addPageBlock(blocks, newBlock);
      expect(result).toHaveLength(2);
      expect(result[1].order).toBe(1);
    });

    it('should remove block from page', () => {
      const blocks: PageBlock[] = [
        { id: '1', type: 'heading', content: {}, order: 0 },
        { id: '2', type: 'paragraph', content: {}, order: 1 },
      ];
      const result = removePageBlock(blocks, '1');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });

    it('should update block in page', () => {
      const blocks: PageBlock[] = [
        { id: '1', type: 'heading', content: { text: 'Old' }, order: 0 },
      ];
      const result = updatePageBlock(blocks, '1', { content: { text: 'New' } });
      expect(result[0].content.text).toBe('New');
    });
  });
});

// Template Engine Tests
import {
  renderTemplate,
  validateTemplate,
  extractVariables,
  type Template,
} from '@/lib/template-engine';

describe('Template Engine', () => {
  describe('renderTemplate', () => {
    it('should render template with variables', () => {
      const template: Template = {
        id: '1',
        tenantId: 'tenant-1',
        name: 'Test Template',
        category: 'loja',
        html: '<h1>{{title}}</h1><p>{{description}}</p>',
        css: '',
        variables: [],
        isPublic: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const variables = {
        title: 'Welcome',
        description: 'My Store',
      };

      const result = renderTemplate(template, variables);
      expect(result.html).toContain('Welcome');
      expect(result.html).toContain('My Store');
    });

    it('should escape HTML in variables', () => {
      const template: Template = {
        id: '1',
        tenantId: 'tenant-1',
        name: 'Test Template',
        category: 'loja',
        html: '<p>{{text}}</p>',
        css: '',
        variables: [],
        isPublic: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = renderTemplate(template, { text: '<script>alert("xss")</script>' });
      expect(result.html).not.toContain('<script>');
      expect(result.html).toContain('&lt;script&gt;');
    });
  });

  describe('validateTemplate', () => {
    it('should validate correct template', () => {
      const template = {
        name: 'Test',
        category: 'loja' as const,
        html: '<div>Content</div>',
      };
      const result = validateTemplate(template);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid template', () => {
      const template = { name: '', category: 'invalid' as any };
      const result = validateTemplate(template);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('extractVariables', () => {
    it('should extract variables from HTML', () => {
      const html = '<h1>{{title}}</h1><p>{{description}}</p>';
      const variables = extractVariables(html);
      expect(variables).toContain('title');
      expect(variables).toContain('description');
      expect(variables).toHaveLength(2);
    });

    it('should not extract duplicates', () => {
      const html = '<h1>{{title}}</h1><h2>{{title}}</h2>';
      const variables = extractVariables(html);
      expect(variables).toHaveLength(1);
    });
  });
});

// Publishing Tests
import {
  createPageVersion,
  publishPageVersion,
  compareVersions,
  generatePageUrl,
  generatePreviewLink,
} from '@/lib/publishing';

describe('Publishing', () => {
  describe('Page versions', () => {
    it('should create page version', () => {
      const version = createPageVersion('page-1', 1, {
        title: 'Test',
        content: {},
      });
      expect(version.pageId).toBe('page-1');
      expect(version.versionNumber).toBe(1);
      expect(version.status).toBe('DRAFT');
    });

    it('should publish page version', () => {
      const version = createPageVersion('page-1', 1, {
        title: 'Test',
        content: {},
      });
      const published = publishPageVersion(version);
      expect(published.status).toBe('PUBLISHED');
      expect(published.publishedAt).toBeDefined();
    });
  });

  describe('Version comparison', () => {
    it('should compare versions correctly', () => {
      const v1 = createPageVersion('page-1', 1, {
        title: 'Old Title',
        content: {},
      });
      const v2 = createPageVersion('page-1', 2, {
        title: 'New Title',
        content: { text: 'Updated' },
      });

      const comparison = compareVersions(v1, v2);
      expect(comparison.changed).toBe(true);
      expect(comparison.differences.length).toBeGreaterThan(0);
    });
  });

  describe('URL generation', () => {
    it('should generate page URL', () => {
      const url = generatePageUrl('my-store', 'products');
      expect(url).toContain('my-store');
      expect(url).toContain('products');
      expect(url).toMatch(/^https?:\/\//);
    });

    it('should generate preview link', () => {
      const link = generatePreviewLink('page-1', 'token123');
      expect(link).toContain('page-1');
      expect(link).toContain('token123');
      expect(link).toContain('preview');
    });
  });
});

// Analytics Tests
import {
  recordPageView,
  recordEvent,
  detectDeviceType,
  calculateBounceRate,
  groupEventsByDate,
  calculateEngagementScore,
} from '@/lib/analytics';

describe('Analytics', () => {
  describe('Event recording', () => {
    it('should record page view', () => {
      const view = recordPageView(
        'page-1',
        'tenant-1',
        'Mozilla/5.0...',
        '192.168.1.1',
        'google.com',
      );
      expect(view.pageId).toBe('page-1');
      expect(view.ipAddress).toBe('192.168.1.1');
      expect(view.referrer).toBe('google.com');
    });

    it('should record event', () => {
      const event = recordEvent('page-1', 'tenant-1', 'BUTTON_CLICK', {
        buttonId: 'cta',
      });
      expect(event.eventType).toBe('BUTTON_CLICK');
      expect(event.eventData).toEqual({ buttonId: 'cta' });
    });
  });

  describe('Device detection', () => {
    it('should detect mobile devices', () => {
      const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)';
      expect(detectDeviceType(ua)).toBe('mobile');
    });

    it('should detect desktop devices', () => {
      const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';
      expect(detectDeviceType(ua)).toBe('desktop');
    });

    it('should detect tablet devices', () => {
      const ua = 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)';
      expect(detectDeviceType(ua)).toBe('tablet');
    });
  });

  describe('Metrics calculation', () => {
    it('should calculate bounce rate', () => {
      const events: any[] = Array(10).fill({ eventType: 'PAGE_VIEW' });
      const rate = calculateBounceRate(events, 10);
      expect(rate).toBeGreaterThan(0);
      expect(rate).toBeLessThanOrEqual(100);
    });

    it('should calculate engagement score', () => {
      const score = calculateEngagementScore(100, 25, 5);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('Data grouping', () => {
    it('should group events by date', () => {
      const now = new Date();
      const events: any[] = [
        { timestamp: now, eventType: 'PAGE_VIEW' },
        { timestamp: now, eventType: 'BUTTON_CLICK' },
        { timestamp: new Date(now.getTime() + 86400000), eventType: 'PAGE_VIEW' },
      ];

      const grouped = groupEventsByDate(events);
      expect(Object.keys(grouped).length).toBeGreaterThan(0);
    });
  });
});
