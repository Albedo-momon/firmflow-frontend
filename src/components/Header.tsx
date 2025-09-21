import React from 'react';
import Link from 'next/link';

export const Header: React.FC = () => {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-black">
              FirmFlow
            </Link>
          </div>

          <nav className="hidden md:flex space-x-8">
            <Link
              href="/"
              className="text-gray-600 hover:text-black transition-colors"
            >
              Home
            </Link>
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-black transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/demo-upload"
              className="text-gray-600 hover:text-black transition-colors"
            >
              Demo Upload
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="text-gray-600 hover:text-black transition-colors"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
