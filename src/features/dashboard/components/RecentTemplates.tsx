import React from 'react';
import { FileText, Clock } from 'lucide-react';

const recentTemplates = [
  { id: 1, name: 'Summer Sale Banner', type: 'Promotion', date: '2h ago' },
  { id: 2, name: 'Product Showcase', type: 'Product Info', date: '4h ago' },
  { id: 3, name: 'Store Directory', type: 'Directional', date: '1d ago' },
  { id: 4, name: 'Weekly Deals', type: 'Promotion', date: '2d ago' },
];

export default function RecentTemplates() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Templates</h2>
      <div className="space-y-4">
        {recentTemplates.map((template) => (
          <div key={template.id} className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <FileText className="h-5 w-5 text-indigo-600" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-900">{template.name}</p>
              <p className="text-sm text-gray-500">{template.type}</p>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-1" />
              {template.date}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}