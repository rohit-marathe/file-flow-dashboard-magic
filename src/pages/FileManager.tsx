
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import FileManagerComponent from '@/components/fileManager/FileManagerComponent';

const FileManager = () => {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activePath={location.pathname} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-auto overflow-y-auto">
          <FileManagerComponent />
        </main>
      </div>
    </div>
  );
};

export default FileManager;
