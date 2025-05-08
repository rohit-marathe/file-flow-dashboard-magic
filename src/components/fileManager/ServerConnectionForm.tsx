
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { toast } from 'sonner';
import { ServerConnection } from '@/types/server';
import { Lock } from 'lucide-react';

interface ServerConnectionFormProps {
  onConnect: (connectionDetails: ServerConnection) => void;
  isConnecting?: boolean;
}

const ServerConnectionForm = ({ onConnect, isConnecting = false }: ServerConnectionFormProps) => {
  const [pemFile, setPemFile] = useState<File | null>(null);

  const form = useForm<{
    ip: string;
    username: string;
    port: string;
    path: string;
  }>({
    defaultValues: {
      ip: '',
      username: 'ubuntu',
      port: '22',
      path: '/var/www/'
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      // Check if it's a PEM file
      if (file.name.endsWith('.pem')) {
        setPemFile(file);
      } else {
        toast.error('Please upload a valid .pem file');
        e.target.value = '';
      }
    }
  };

  const onSubmit = (values: { ip: string; username: string; port: string; path: string }) => {
    if (!pemFile) {
      toast.error('Please upload a PEM key file');
      return;
    }

    // Create connection object with form values and file
    const connectionDetails: ServerConnection = {
      ip: values.ip,
      username: values.username,
      port: Number(values.port),
      path: values.path,
      pemFile: pemFile
    };

    onConnect(connectionDetails);
  };

  return (
    <div className="bg-card border rounded-lg p-6 max-w-md mx-auto mt-8 shadow-sm">
      <div className="flex items-center justify-center mb-6">
        <div className="bg-primary/10 p-3 rounded-full">
          <Lock className="h-6 w-6 text-primary" />
        </div>
      </div>
      
      <h2 className="text-2xl font-semibold mb-6 text-center">SSH Connection</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="ip"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Server IP Address</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g. 192.168.1.1" 
                    {...field}
                    required
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="ubuntu" 
                      {...field}
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="port"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Port</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="22" 
                      {...field}
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="path"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Initial Path</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="/var/www/" 
                    {...field}
                    required
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-2">
            <FormLabel htmlFor="pemFile">SSH Private Key (.pem)</FormLabel>
            <Input
              id="pemFile"
              type="file"
              accept=".pem"
              onChange={handleFileChange}
              required
            />
            {pemFile && (
              <p className="text-sm text-muted-foreground">
                Selected: {pemFile.name}
              </p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={isConnecting}
          >
            {isConnecting ? 'Connecting...' : 'Connect to Server'}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default ServerConnectionForm;
