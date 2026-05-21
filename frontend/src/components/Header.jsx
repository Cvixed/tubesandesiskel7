import React from 'react';

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 py-4 sm:py-6 mb-6 sm:mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-xl sm:text-3xl font-extrabold text-gray-900 tracking-tight text-center">
          SISTEM MONITORING JEMURAN
        </h1>
        <p className="mt-1 sm:mt-2 text-center text-xs sm:text-sm text-gray-500">
          IoT Edge-to-Web Berbasis Arduino
        </p>
      </div>
    </header>
  );
};

export default Header;
