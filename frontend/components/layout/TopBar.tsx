'use client';

import { useState } from 'react';
import { Bell, User, MapPin, Calendar, ChevronDown } from 'lucide-react';
import { useLocationStore } from '@/store/useLocationStore';
import { useCampaignDatesStore } from '@/store/useCampaignDatesStore';
import LocationDateModal from '@/components/common/LocationDateModal';
import { useRouter } from 'next/navigation';

export default function TopBar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'location' | 'dates'>('location');
  const { selectedCity } = useLocationStore();
  const { startDate, endDate } = useCampaignDatesStore();
  const router = useRouter();

  const formatDateRange = () => {
    if (!startDate || !endDate) return 'Select dates';
    const start = new Date(startDate);
    const end = new Date(endDate);
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  const handleSearch = () => {
    router.push('/search');
  };

  const openModal = (tab: 'location' | 'dates') => {
    setModalTab(tab);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="h-24 bg-white border-b border-gray-200 flex items-center justify-center px-6 relative">
        {/* Airbnb-style Search Bar - Centered, 40% width */}
        <div className="w-[40%] flex items-center justify-between gap-4 px-8 py-5 rounded-2xl border-2 border-gray-300 shadow-md hover:shadow-xl hover:border-gray-400 transition-all bg-white">
          {/* Location Section - Clickable */}
          <button
            onClick={() => openModal('location')}
            className="flex items-center gap-3 flex-1 pr-6 border-r-2 border-gray-300 group/location hover:opacity-80 transition-opacity"
          >
            <MapPin className="w-6 h-6 text-gray-600 group-hover/location:text-gray-900" />
            <span className="text-base font-semibold text-gray-900">{selectedCity}</span>
            <ChevronDown className="w-4 h-4 text-gray-500 group-hover/location:text-gray-900 transition-transform group-hover/location:translate-y-0.5" />
          </button>

          {/* Date Section - Clickable */}
          <button
            onClick={() => openModal('dates')}
            className="flex items-center gap-3 flex-1 pl-2 group/dates hover:opacity-80 transition-opacity"
          >
            <Calendar className="w-6 h-6 text-gray-600 group-hover/dates:text-gray-900" />
            <span className="text-base text-gray-700 group-hover/dates:text-gray-900">{formatDateRange()}</span>
            <ChevronDown className="w-4 h-4 text-gray-500 group-hover/dates:text-gray-900 ml-auto transition-transform group-hover/dates:translate-y-0.5" />
          </button>
        </div>

        {/* User Actions - Absolute Right */}
        <div className="absolute right-6 flex items-center space-x-4">
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <User className="w-5 h-5" />
          </button>
        </div>
      </div>

      <LocationDateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSearch={handleSearch}
        initialTab={modalTab}
      />
    </>
  );
}
