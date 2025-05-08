import { FileItem, Site, ServerConnection } from '@/types/server';
import axios from 'axios';

const API_BASE_URL = '/api';

// Get list of sites/domains
export const getSites = async (): Promise<Site[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/sites`);
    if (!response.ok) {
      throw new Error('Failed to fetch sites');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching sites:', error);
    throw error;
  }
};

// List files in a directory
export const listFiles = async (ip: string, path: string, pemFile?: File): Promise<FileItem[]> => {
  try {
    console.log("Fetching actual files from server:", ip, path);
    
    // For production, we would make an actual API call here
    // But since we don't have a backend API ready yet, we're adding
    // some realistic mock data with a delay to simulate real API call
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create more realistic file listings based on the path
    let filesData: FileItem[] = [];
    
    if (path.includes('wp.zyntr.com')) {
      // WordPress site structure
      filesData = [
        {
          name: 'wp-admin',
          type: 'directory',
          size: 0,
          modified: new Date().toISOString(),
          path: `${path}/wp-admin`
        },
        {
          name: 'wp-content',
          type: 'directory',
          size: 0,
          modified: new Date().toISOString(),
          path: `${path}/wp-content`
        },
        {
          name: 'wp-includes',
          type: 'directory',
          size: 0,
          modified: new Date().toISOString(),
          path: `${path}/wp-includes`
        },
        {
          name: 'index.php',
          type: 'file',
          size: 418,
          modified: new Date().toISOString(),
          path: `${path}/index.php`
        },
        {
          name: 'wp-config.php',
          type: 'file',
          size: 2853,
          modified: new Date().toISOString(),
          path: `${path}/wp-config.php`
        },
        {
          name: '.htaccess',
          type: 'file',
          size: 246,
          modified: new Date().toISOString(),
          path: `${path}/.htaccess`
        }
      ];
    } else if (path.includes('/var/www/html')) {
      // Common web server root structure
      filesData = [
        {
          name: 'wp.zyntr.com',
          type: 'directory',
          size: 0,
          modified: new Date().toISOString(),
          path: `${path}/wp.zyntr.com`
        },
        {
          name: 'index.html',
          type: 'file',
          size: 1024,
          modified: new Date().toISOString(),
          path: `${path}/index.html`
        },
        {
          name: 'favicon.ico',
          type: 'file',
          size: 4096,
          modified: new Date().toISOString(),
          path: `${path}/favicon.ico`
        }
      ];
    } else if (path === '/var/www/') {
      // Top level directory
      filesData = [
        {
          name: 'html',
          type: 'directory',
          size: 0,
          modified: new Date().toISOString(),
          path: `/var/www/html`
        },
        {
          name: 'cgi-bin',
          type: 'directory',
          size: 0,
          modified: new Date().toISOString(),
          path: `/var/www/cgi-bin`
        }
      ];
    } else {
      // Default generic files
      filesData = [
        {
          name: 'README.md',
          type: 'file',
          size: 1024,
          modified: new Date().toISOString(),
          path: `${path}/README.md`
        },
        {
          name: 'config',
          type: 'directory',
          size: 0,
          modified: new Date().toISOString(),
          path: `${path}/config`
        },
        {
          name: 'logs',
          type: 'directory',
          size: 0,
          modified: new Date().toISOString(),
          path: `${path}/logs`
        }
      ];
    }
    
    return filesData;
  } catch (error) {
    console.error('Error listing files:', error);
    throw error;
  }
};

// Create a new folder
export const createFolder = async (ip: string, path: string, folderName: string, pemFile?: File): Promise<void> => {
  try {
    // Mock API call with delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`Creating folder: ${folderName} at ${path} on ${ip}`);
    // This would be an actual API call in production
  } catch (error) {
    console.error('Error creating folder:', error);
    throw error;
  }
};

// Upload a file
export const uploadFile = async (ip: string, path: string, file: File, pemFile?: File): Promise<void> => {
  try {
    // Mock API call with delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`Uploading file: ${file.name} to ${path} on ${ip}`);
    // This would be an actual API call in production
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Rename a file or folder
export const renameItem = async (ip: string, path: string, oldName: string, newName: string, pemFile?: File): Promise<void> => {
  try {
    // Mock API call with delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`Renaming: ${oldName} to ${newName} at ${path} on ${ip}`);
    // This would be an actual API call in production
  } catch (error) {
    console.error('Error renaming item:', error);
    throw error;
  }
};

// Delete a file or folder
export const deleteItem = async (ip: string, path: string, pemFile?: File): Promise<void> => {
  try {
    // Mock API call with delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`Deleting: ${path} on ${ip}`);
    // This would be an actual API call in production
  } catch (error) {
    console.error('Error deleting item:', error);
    throw error;
  }
};

// Read file content
export const readFile = async (ip: string, path: string, pemFile?: File): Promise<string> => {
  try {
    // Mock API call with delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`Reading file: ${path} on ${ip}`);
    // Mock content
    return `# This is a mock file content
This would be the actual content of ${path} in production.
`;
  } catch (error) {
    console.error('Error reading file:', error);
    throw error;
  }
};

// Save file content
export const saveFile = async (ip: string, path: string, content: string, pemFile?: File): Promise<void> => {
  try {
    // Mock API call with delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`Saving file: ${path} on ${ip} with content length: ${content.length}`);
    // This would be an actual API call in production
  } catch (error) {
    console.error('Error saving file:', error);
    throw error;
  }
};
