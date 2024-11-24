import React from 'react';
import { ArrowLeft } from 'lucide-react';
import DashboardStats from './DashboardStats';
import RecentTemplates from './RecentTemplates';

interface DashboardProps {
  onLogout: () => void;
  onNewTemplate: () => void;
  onBack: () => void;
}

export default function Dashboard({ onLogout, onNewTemplate, onBack }: DashboardProps) {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-4 bg-white shadow-sm flex justify-between items-center">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver al inicio
        </button>
        <div className="flex gap-4">
          <button
            onClick={onNewTemplate}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Nueva Plantilla
          </button>
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

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