'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function SettingsPage() {
  const [storeName, setStoreName] = React.useState('Minha Loja');
  const [email, setEmail] = React.useState('contact@minha-loja.com');
  const [phone, setPhone] = React.useState('(11) 9999-9999');
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // TODO: Call API to save settings
    setTimeout(() => {
      setIsSaving(false);
      alert('Settings saved successfully!');
    }, 1000);
  };

  return (
    <DashboardLayout
      title="Settings"
      description="Manage your account and preferences"
    >
      <div className="max-w-2xl space-y-6">
        {/* Store Information */}
        <Card>
          <CardHeader title="Store Information" />
          <CardBody>
            <div className="space-y-4">
              <Input
                label="Store Name"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                fullWidth
              />
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
              />
              <Input
                label="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                fullWidth
              />
            </div>
          </CardBody>
        </Card>

        {/* Branding */}
        <Card>
          <CardHeader title="Branding" />
          <CardBody>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <p className="text-gray-600">
                    Drag and drop your logo here, or click to select
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Color
                </label>
                <input
                  type="color"
                  defaultValue="#0ea5e9"
                  className="w-12 h-12 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader title="Security" />
          <CardBody>
            <div className="space-y-4">
              <Button variant="secondary" fullWidth>
                Change Password
              </Button>
              <Button variant="secondary" fullWidth>
                Enable Two-Factor Authentication
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Save Button */}
        <div className="flex gap-4">
          <Button
            variant="primary"
            isLoading={isSaving}
            onClick={handleSave}
          >
            Save Changes
          </Button>
          <Button variant="ghost">
            Cancel
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
