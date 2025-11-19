'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardBody, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface Page {
  id: string;
  title: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
}

// Mock data
const mockPages: Page[] = [
  {
    id: '1',
    title: 'Página Inicial',
    status: 'published',
    createdAt: '2024-11-15',
    updatedAt: '2024-11-19',
  },
  {
    id: '2',
    title: 'Serviços',
    status: 'published',
    createdAt: '2024-11-14',
    updatedAt: '2024-11-18',
  },
  {
    id: '3',
    title: 'Contato',
    status: 'draft',
    createdAt: '2024-11-19',
    updatedAt: '2024-11-19',
  },
];

export default function PagesPage() {
  return (
    <DashboardLayout
      title="Pages"
      description="Manage your business pages"
    >
      <div className="space-y-6">
        {/* Header with Create Button */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-600">
              You have {mockPages.length} pages
            </p>
          </div>
          <Button variant="primary">
            Create New Page
          </Button>
        </div>

        {/* Pages List */}
        <div className="grid grid-cols-1 gap-4">
          {mockPages.map((page) => (
            <Card key={page.id} hover>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {page.title}
                    </h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span>Created: {page.createdAt}</span>
                      <span>Updated: {page.updatedAt}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        page.status === 'published'
                          ? 'bg-success-100 text-success-700'
                          : page.status === 'draft'
                            ? 'bg-warning-100 text-warning-700'
                            : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {page.status.charAt(0).toUpperCase() + page.status.slice(1)}
                    </span>
                  </div>
                </div>
              </CardBody>
              <CardFooter>
                <Button variant="secondary" size="sm">
                  Edit
                </Button>
                <Button variant="ghost" size="sm">
                  Preview
                </Button>
                <Button variant="danger" size="sm">
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
