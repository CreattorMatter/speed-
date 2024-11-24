import React from 'react';
import { BarChart3, FileText, Printer, Star } from 'lucide-react';

const stats = [
  { name: 'Active Templates', value: '60+', icon: FileText, color: 'bg-blue-500' },
  { name: 'Monthly Prints', value: '2,345', icon: Printer, color: 'bg-green-500' },
  { name: 'Most Used', value: 'Promo', icon: Star, color: 'bg-yellow-500' },
  { name: 'Usage Stats', value: '+24%', icon: BarChart3, color: 'bg-purple-500' },
];

export default function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.name} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}