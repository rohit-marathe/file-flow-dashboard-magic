
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import FileManagerComponent from '@/components/fileManager/FileManagerComponent';
import ServerConnectionForm from '@/components/fileManager/ServerConnectionForm';
import { ServerConnection } from '@/types/server';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

const FileManager = () => {
  const location = useLocation();
  const [serverConnection, setServerConnection] = useState<ServerConnection | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const handleConnect = async (connectionDetails: ServerConnection) => {
    setIsConnecting(true);
    setConnectionError(null);
    
    try {
      console.log("Attempting SSH connection with:", connectionDetails);
      
      // Validate PEM file
      if (!connectionDetails.pemFile || !(connectionDetails.pemFile instanceof File)) {
        throw new Error('PEM file is required. Please select a valid key file.');
      }
      
      if (connectionDetails.pemFile.size === 0) {
        throw new Error('The selected PEM file appears to be empty.');
      }
      
      // In a real app, we would validate the connection with a test API call here
      // For now we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Store the connection details
      setServerConnection(connectionDetails);
      toast.success("Successfully connected to server");
    } catch (error) {
      console.error("SSH connection failed:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setConnectionError(errorMessage);
      toast.error(`Connection failed: ${errorMessage}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setServerConnection(null);
    setConnectionError(null);
    toast.info("Disconnected from server");
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activePath={location.pathname} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-auto overflow-y-auto">
          {!serverConnection ? (
            <>
              {connectionError && (
                <Alert variant="destructive" className="max-w-md mx-auto mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="ml-2">
                    {connectionError}
                  </AlertDescription>
                </Alert>
              )}
              <ServerConnectionForm onConnect={handleConnect} isConnecting={isConnecting} />
            </>
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
