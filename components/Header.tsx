
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-800 shadow-lg">
      <div className="container mx-auto px-4 md:px-8 py-4">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          <span className="text-indigo-400">Cronicle</span>: Rsync Backup Scheduler
        </h1>
        <p className="text-gray-400 mt-1">
          Create and manage your backup schedules with ease.
        </p>
      </div>
    </header>
  );
};

export default Header;
