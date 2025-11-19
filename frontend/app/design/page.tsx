'use client';

import { Image, Clock, Sparkles } from 'lucide-react';

export default function DesignPage() {
  return (
    <div className="h-[calc(100vh-64px)] bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="w-32 h-32 bg-gradient-to-br from-[#E91E63] to-[#F50057] rounded-3xl flex items-center justify-center shadow-2xl">
              <Image className="w-16 h-16 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 bg-white rounded-full p-2 shadow-lg">
              <Sparkles className="w-6 h-6 text-[#E91E63]" />
            </div>
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Design Studio</h1>
        <p className="text-xl text-gray-600 mb-3">
          Coming Soon!
        </p>
        <p className="text-gray-500 mb-8 max-w-lg mx-auto">
          We're working on bringing you an amazing design experience. Upload and manage your campaign designs, use templates, and collaborate with your team.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 bg-white rounded-full px-6 py-3 inline-flex border border-gray-200">
          <Clock className="w-4 h-4" />
          <span>Launching Q2 2025</span>
        </div>
      </div>
    </div>
  );
}
