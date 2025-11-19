'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface DashboardStats {
  totalPages: number;
  publishedPages: number;
  totalUsers: number;
  monthlyViews: number;
}

export default function DashboardPage() {
  const [stats /* , setStats */] = useState<DashboardStats>({
    totalPages: 12,
    publishedPages: 8,
    totalUsers: 5,
    monthlyViews: 1250,
  });

  // const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load dashboard stats
    // setIsLoading(false);
  }, []);

  return (
    <DashboardLayout
      title="Dashboard"
      description="Welcome to your ComércioPago dashboard"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Pages</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.totalPages}
                </p>
              </div>
              <div className="text-4xl">📄</div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Published</p>
                <p className="text-3xl font-bold text-success-600 mt-2">
                  {stats.publishedPages}
                </p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.totalUsers}
                </p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Views</p>
                <p className="text-3xl font-bold text-brand-600 mt-2">
                  {stats.monthlyViews}
                </p>
              </div>
              <div className="text-4xl">📊</div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader
          title="Quick Actions"
          subtitle="Get started with your store"
        />
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="primary" fullWidth>
              Create New Page
            </Button>
            <Button variant="secondary" fullWidth>
              Manage Users
            </Button>
            <Button variant="secondary" fullWidth>
              View Analytics
            </Button>
          </div>
        </CardBody>
      </Card>
    </DashboardLayout>
  );
}
