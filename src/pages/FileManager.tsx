
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import FileManagerComponent from '@/components/fileManager/FileManagerComponent';
import ServerConnectionForm from '@/components/fileManager/ServerConnectionForm';
import { ServerConnection } from '@/types/server';

const FileManager = () => {
  const location = useLocation();
  const [serverConnection, setServerConnection] = useState<ServerConnection | null>(null);

  const handleConnect = (connectionDetails: ServerConnection) => {
    console.log("Connecting with details:", connectionDetails);
    setServerConnection(connectionDetails);
  };

  const handleDisconnect = () => {
    setServerConnection(null);
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activePath={location.pathname} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-auto overflow-y-auto">
          {!serverConnection ? (
            <ServerConnectionForm onConnect={handleConnect} />
          ) : (
            <FileManagerComponent 
              serverConnection={serverConnection} 
              onDisconnect={handleDisconnect}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default FileManager;
