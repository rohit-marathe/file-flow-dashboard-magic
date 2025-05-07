
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

interface ServerConnectionFormProps {
  onConnect: (connectionDetails: ServerConnection) => void;
}

const ServerConnectionForm = ({ onConnect }: ServerConnectionFormProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [pemFile, setPemFile] = useState<File | null>(null);

  const form = useForm<{
    ip: string;
    path: string;
  }>({
    defaultValues: {
      ip: '',
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

  const onSubmit = (values: { ip: string; path: string }) => {
    if (!pemFile) {
      toast.error('Please upload a PEM key file');
      return;
    }

    // Create connection object with form values and file
    const connectionDetails: ServerConnection = {
      ip: values.ip,
      path: values.path,
      pemFile: pemFile
    };

    setIsUploading(true);
    
    // Simulate connection test
    setTimeout(() => {
      setIsUploading(false);
      onConnect(connectionDetails);
      toast.success('Successfully connected to server');
    }, 1500);
  };

  return (
    <div className="bg-card border rounded-lg p-6 max-w-md mx-auto mt-8 shadow-sm">
      <h2 className="text-2xl font-semibold mb-6">Connect to Server</h2>
      
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
            disabled={isUploading}
          >
            {isUploading ? 'Connecting...' : 'Connect to Server'}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default ServerConnectionForm;
