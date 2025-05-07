
import { FileItem, Site } from '@/types/server';

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
    // For now we're returning mock data since the backend isn't implemented yet
    // This will be replaced with actual API calls once the backend is ready
    
    // Mock response delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock file data
    const mockFiles: FileItem[] = [
      {
        name: 'index.html',
        type: 'file',
        size: 2048,
        modified: new Date().toISOString(),
        path: `${path}/index.html`
      },
      {
        name: 'images',
        type: 'directory',
        size: 0,
        modified: new Date().toISOString(),
        path: `${path}/images`
      },
      {
        name: 'styles.css',
        type: 'file',
        size: 4096,
        modified: new Date().toISOString(),
        path: `${path}/styles.css`
      }
    ];
    
    return mockFiles;
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
