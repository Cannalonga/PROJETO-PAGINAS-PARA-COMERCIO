'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

// Mock data
const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@example.com',
    firstName: 'João',
    lastName: 'Silva',
    role: 'CLIENTE_ADMIN',
    isActive: true,
    createdAt: '2024-11-15',
  },
  {
    id: '2',
    email: 'user@example.com',
    firstName: 'Maria',
    lastName: 'Santos',
    role: 'CLIENTE_USER',
    isActive: true,
    createdAt: '2024-11-18',
  },
];

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredUsers = mockUsers.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <DashboardLayout
      title="Users"
      description="Manage team members and permissions"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="primary">
            Add User
          </Button>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader title="Team Members" />
          <CardBody>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Email
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Name
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Role
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {user.email}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {user.firstName} {user.lastName}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {user.role}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            user.isActive
                              ? 'bg-success-100 text-success-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-right">
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                        <Button variant="danger" size="sm">
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  );
}
