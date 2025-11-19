'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface PageBlock {
  id: string;
  type: string;
  content: Record<string, any>;
  order: number;
}

export default function PageEditorPage({ params }: { params: { id: string } }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [blocks, setBlocks] = useState<PageBlock[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Load page data
    loadPage();
  }, [params.id]);

  const loadPage = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/protected/pages/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setTitle(data.title);
        setDescription(data.description || '');
        setBlocks(data.content || []);
      }
    } catch (error) {
      console.error('Failed to load page:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBlock = () => {
    const newBlock: PageBlock = {
      id: `block-${Date.now()}`,
      type: 'paragraph',
      content: { text: '' },
      order: blocks.length,
    };
    setBlocks([...blocks, newBlock]);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/protected/pages/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          content: blocks,
        }),
      });

      if (response.ok) {
        alert('Page saved successfully!');
      }
    } catch (error) {
      console.error('Failed to save page:', error);
      alert('Failed to save page');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <DashboardLayout title="Loading...">Loading page...</DashboardLayout>;
  }

  return (
    <DashboardLayout title={`Edit: ${title}`} description="Edit your page content">
      <div className="max-w-4xl space-y-6">
        {/* Page Metadata */}
        <Card>
          <CardHeader title="Page Information" />
          <CardBody>
            <div className="space-y-4">
              <Input
                label="Page Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                fullWidth
              />
              <Input
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                fullWidth
              />
            </div>
          </CardBody>
        </Card>

        {/* Page Content */}
        <Card>
          <CardHeader title="Page Content" />
          <CardBody>
            <div className="space-y-4">
              {blocks.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No blocks yet. Add one to get started!
                </p>
              ) : (
                blocks.map((block) => (
                  <div
                    key={block.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-brand-300"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{block.type}</p>
                        <p className="text-sm text-gray-600">
                          {JSON.stringify(block.content).substring(0, 50)}...
                        </p>
                      </div>
                      <Button variant="danger" size="sm">
                        Remove
                      </Button>
                    </div>
                  </div>
                ))
              )}

              <Button variant="secondary" fullWidth onClick={handleAddBlock}>
                + Add Block
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            variant="primary"
            isLoading={isSaving}
            onClick={handleSave}
          >
            Save Changes
          </Button>
          <Button variant="ghost">
            Preview
          </Button>
          <Button variant="danger">
            Delete Page
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
