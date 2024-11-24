import React from 'react';
import { Layout, LogOut, Plus, Settings } from 'lucide-react';
import DashboardStats from './DashboardStats';
import RecentTemplates from './RecentTemplates';

interface DashboardProps {
  onLogout: () => void;
  onNewTemplate: () => void;
}

export default function Dashboard({ onLogout, onNewTemplate }: DashboardProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Layout className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Speed+</span>
            </div>
            <div className="flex items-center space-x-4">
              <button className="btn-primary" onClick={onNewTemplate}>
                <Plus className="h-5 w-5 mr-2" />
                New Template
              </button>
              <button className="btn-icon">
                <Settings className="h-5 w-5 text-gray-500" />
              </button>
              <button onClick={onLogout} className="btn-icon">
                <LogOut className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here's what's happening with your templates.</p>
          </div>
        </div>

        <DashboardStats />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentTemplates />
          </div>
          <div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full btn-secondary" onClick={onNewTemplate}>
                  Create Template
                </button>
                <button className="w-full btn-secondary">View Catalog</button>
                <button className="w-full btn-secondary">Manage Approvals</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}