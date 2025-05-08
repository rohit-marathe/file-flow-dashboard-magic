
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import FileManagerComponent from '@/components/fileManager/FileManagerComponent';
import ServerConnectionForm from '@/components/fileManager/ServerConnectionForm';
import { ServerConnection } from '@/types/server';
import { toast } from 'sonner';

const FileManager = () => {
  const location = useLocation();
  const [serverConnection, setServerConnection] = useState<ServerConnection | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async (connectionDetails: ServerConnection) => {
    setIsConnecting(true);
    
    try {
      console.log("Attempting SSH connection with:", connectionDetails);
      // Simulate SSH connection (in a real app this would be an actual SSH connection)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setServerConnection(connectionDetails);
      toast.success("Successfully connected to server");
    } catch (error) {
      console.error("SSH connection failed:", error);
      toast.error("Failed to connect. Please check your credentials and try again.");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setServerConnection(null);
    toast.info("Disconnected from server");
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activePath={location.pathname} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-auto overflow-y-auto">
          {!serverConnection ? (
            <ServerConnectionForm onConnect={handleConnect} isConnecting={isConnecting} />
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
