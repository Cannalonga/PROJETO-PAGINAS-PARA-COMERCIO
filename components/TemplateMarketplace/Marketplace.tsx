import React, { useState, useCallback, useMemo } from 'react';
import { Template } from '@/types';
import { searchTemplates, filterTemplates, getTrendingTemplates } from '@/lib/template-engine';
import SearchBar from './SearchBar';
import TemplateGrid from './TemplateGrid';
import TemplatePreview from './TemplatePreview';

interface TemplateMarketplaceProps {
  templates: (Template & { stats?: { views: number; clones: number; averageRating: number } })[];
  onTemplateSelect: (template: Template) => Promise<void>;
  isLoading?: boolean;
}

export interface ViewOption {
  type: 'all' | 'trending' | 'liked';
  label: string;
  icon: string;
}

const TemplateMarketplace: React.FC<TemplateMarketplaceProps> = ({
  templates,
  onTemplateSelect,
  isLoading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isCloning, setIsCloning] = useState(false);
  const [viewOption, setViewOption] = useState<'all' | 'trending'>('all');

  // Filter templates
  const filteredTemplates = useMemo(() => {
    let result = templates as any;

    // Apply view option
    if (viewOption === 'trending') {
      result = getTrendingTemplates(result, templates.length);
    }

    // Apply filters
    result = filterTemplates(result, {
      category: selectedCategory || undefined,
      minRating: minRating > 0 ? minRating : undefined,
      isPublic: true,
    });

    // Apply search
    if (searchQuery) {
      result = searchTemplates(result, searchQuery);
    }

    return result;
  }, [templates, searchQuery, selectedCategory, minRating, viewOption]);

  // Handle template select
  const handleSelectTemplate = useCallback((template: Template) => {
    setSelectedTemplate(template);
    setIsPreviewOpen(true);
  }, []);

  // Handle clone
  const handleCloneTemplate = useCallback(
    async (template: Template) => {
      setIsCloning(true);
      try {
        await onTemplateSelect(template);
        setIsPreviewOpen(false);
        // Show success notification (you can add toast here)
      } finally {
        setIsCloning(false);
      }
    },
    [onTemplateSelect]
  );

  const VIEW_OPTIONS: ViewOption[] = [
    { type: 'all', label: 'Todos', icon: '📋' },
    { type: 'trending', label: 'Trending', icon: '🔥' },
  ];

  return (
    <div className="template-marketplace flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-800">🎨 Template Marketplace</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* View Options */}
        <div className="flex gap-2">
          {VIEW_OPTIONS.map((option) => (
            <button
              key={option.type}
              onClick={() => setViewOption(option.type as any)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                viewOption === option.type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option.icon} {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <SearchBar
        onSearch={setSearchQuery}
        onCategoryChange={setSelectedCategory}
        onMinRatingChange={setMinRating}
        isLoading={isLoading}
      />

      {/* Templates Grid */}
      <div className="flex-1 overflow-y-auto">
        <TemplateGrid
          templates={filteredTemplates}
          isLoading={isLoading}
          onTemplateSelect={handleSelectTemplate}
        />
      </div>

      {/* Template Preview Modal */}
      <TemplatePreview
        template={selectedTemplate}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onClone={handleCloneTemplate}
        isCloning={isCloning}
      />
    </div>
  );
};

export default TemplateMarketplace;
