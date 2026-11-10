
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface SidebarToggleProps {
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
}

export const SidebarToggle = ({ 
  isMobileMenuOpen, 
  toggleMobileMenu 
}: SidebarToggleProps) => {
  return (
    <button
      onClick={toggleMobileMenu}
      className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md"
    >
      <div className="w-5 h-5 flex flex-col justify-between">
        <span className={`block w-full h-0.5 bg-gray-800 transition-transform ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
        <span className={`block w-full h-0.5 bg-gray-800 transition-opacity ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
        <span className={`block w-full h-0.5 bg-gray-800 transition-transform ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
      </div>
    </button>
  );
};
