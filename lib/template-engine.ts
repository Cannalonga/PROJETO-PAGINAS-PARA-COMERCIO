/**
 * Template Engine Library
 * Handles template creation, validation, and rendering
 */

export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'image';
  required: boolean;
  description?: string;
}

export interface Template {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  category: 'loja' | 'restaurante' | 'servicos' | 'consultorio' | 'salon' | 'custom';
  thumbnail?: string;
  variables: TemplateVariable[];
  html: string;
  css: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTemplateRequest {
  name: string;
  category: string;
  description?: string;
  html: string;
  css?: string;
  variables?: TemplateVariable[];
}

/**
 * Render template with variables
 */
export function renderTemplate(
  template: Template,
  variables: Record<string, any>,
): { html: string; css: string } {
  let html = template.html;

  // Replace variables from template.variables array
  template.variables.forEach((variable) => {
    const value = variables[variable.name];
    const placeholder = `{{${variable.name}}}`;
    const escapedValue = String(value || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    html = html.replace(new RegExp(placeholder, 'g'), escapedValue);
  });

  // Also replace any {{variable}} patterns found in HTML with provided variables
  const variablePattern = /\{\{([a-zA-Z_][a-zA-Z0-9_]*)\}\}/g;
  html = html.replace(variablePattern, (match, varName) => {
    if (variables.hasOwnProperty(varName)) {
      const value = variables[varName];
      const escapedValue = String(value || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return escapedValue;
    }
    return match;
  });

  return {
    html,
    css: template.css,
  };
}

/**
 * Validate template structure
 */
export function validateTemplate(template: Partial<Template>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!template.name) errors.push('Template name is required');
  if (!template.html) errors.push('Template HTML is required');
  if (!template.category) errors.push('Template category is required');

  const validCategories = [
    'loja',
    'restaurante',
    'servicos',
    'consultorio',
    'salon',
    'custom',
  ];
  if (template.category && !validCategories.includes(template.category)) {
    errors.push(`Invalid category: ${template.category}`);
  }

  if (template.html && template.html.length > 100000) {
    errors.push('Template HTML is too large (max 100KB)');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Extract variables from template HTML
 */
export function extractVariables(html: string): string[] {
  const regex = /{{(\w+)}}/g;
  const matches: string[] = [];
  let match;

  // eslint-disable-next-line no-cond-assign
  while ((match = regex.exec(html)) !== null) {
    if (!matches.includes(match[1])) {
      matches.push(match[1]);
    }
  }

  return matches;
}

/**
 * Clone template for tenant
 */
export function createTemplateClone(
  template: Template,
  tenantId: string,
): Omit<Template, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    tenantId,
    name: `${template.name} (Copy)`,
    description: template.description,
    category: template.category,
    thumbnail: template.thumbnail,
    variables: template.variables,
    html: template.html,
    css: template.css,
    isPublic: false,
  };
}

/**
 * Get template by category
 */
export function filterTemplatesByCategory(
  templates: Template[],
  category: string,
): Template[] {
  return templates.filter((t) => t.category === category);
}

/**
 * Template Marketplace Features
 */

export interface TemplateStats {
  templateId: string;
  views: number;
  clones: number;
  averageRating: number;
}

export interface TemplateReview {
  id: string;
  templateId: string;
  userId: string;
  rating: number; // 1-5
  review?: string;
  createdAt: Date;
}

/**
 * Get template stats (views, clones, rating)
 */
export function getTemplateStats(stats: TemplateStats): TemplateStats {
  return stats;
}

/**
 * Calculate template popularity score
 */
export function calculateTemplatePopularityScore(stats: TemplateStats): number {
  // Score = (views * 0.1) + (clones * 0.5) + (rating * 100)
  return stats.views * 0.1 + stats.clones * 0.5 + stats.averageRating * 100;
}

/**
 * Get trending templates
 */
export function getTrendingTemplates(
  templates: (Template & { stats: TemplateStats })[],
  limit: number = 10,
): (Template & { stats: TemplateStats })[] {
  return templates
    .sort((a, b) => {
      const scoreA = calculateTemplatePopularityScore(a.stats);
      const scoreB = calculateTemplatePopularityScore(b.stats);
      return scoreB - scoreA;
    })
    .slice(0, limit);
}

/**
 * Search templates by name/description
 */
export function searchTemplates(
  templates: Template[],
  query: string,
): Template[] {
  const lowerQuery = query.toLowerCase();
  return templates.filter(
    (t) =>
      t.name.toLowerCase().includes(lowerQuery) ||
      (t.description && t.description.toLowerCase().includes(lowerQuery)),
  );
}

/**
 * Filter templates with advanced criteria
 */
export interface TemplateFilterCriteria {
  category?: string;
  minRating?: number;
  maxPrice?: number;
  isPublic?: boolean;
  search?: string;
}

export function filterTemplates(
  templates: (Template & { stats: TemplateStats })[],
  criteria: TemplateFilterCriteria,
): (Template & { stats: TemplateStats })[] {
  return templates.filter((t) => {
    if (criteria.category && t.category !== criteria.category) return false;
    if (criteria.minRating && t.stats.averageRating < criteria.minRating) return false;
    if (criteria.isPublic !== undefined && t.isPublic !== criteria.isPublic) return false;
    if (
      criteria.search &&
      !t.name.toLowerCase().includes(criteria.search.toLowerCase()) &&
      !(t.description && t.description.toLowerCase().includes(criteria.search.toLowerCase()))
    )
      return false;
    return true;
  });
}

/**
 * Rate template
 */
export function rateTemplate(
  reviews: TemplateReview[],
  templateId: string,
  rating: number,
): number {
  if (rating < 1 || rating > 5) throw new Error('Rating must be between 1 and 5');

  const validReviews = reviews.filter((r) => r.templateId === templateId && r.rating);
  const sum = validReviews.reduce((acc, r) => acc + r.rating, 0) + rating;
  return sum / (validReviews.length + 1);
}

/**
 * Clone template to new page
 */
export function cloneTemplateToPage(
  template: Template,
  pageId: string,
  _tenantId: string,
): { pageId: string; templateId: string; content: Record<string, any> } {
  return {
    pageId,
    templateId: template.id,
    content: {
      html: template.html,
      css: template.css,
      variables: template.variables,
    },
  };
}

