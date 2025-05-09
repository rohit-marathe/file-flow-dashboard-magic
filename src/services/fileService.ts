
import { FileItem, Site, ServerConnection, FilePermissions, BackendResponse } from '@/types/server';

const API_BASE_URL = '/api';  // Using the proxy

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

// Create FormData with connection details and PEM file
const createFormData = (connection: Partial<ServerConnection>, additionalData: Record<string, any> = {}) => {
  const formData = new FormData();
  
  // Add connection details
  if (connection.ip) formData.append('ip', connection.ip);
  if (connection.username) formData.append('username', connection.username || 'root');
  if (connection.port) formData.append('port', connection.port?.toString() || '22');
  if (connection.path) formData.append('path', connection.path);
  
  // Add PEM file if provided
  if (connection.pemFile && connection.pemFile instanceof File) {
    formData.append('pemFile', connection.pemFile);
  } else {
    console.warn('PEM file is missing or not a File object');
  }
  
  // Add any additional data
  Object.entries(additionalData).forEach(([key, value]) => {
    if (value !== undefined) {
      if (typeof value === 'object' && !(value instanceof File)) {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value);
      }
    }
  });
  
  return formData;
};

// List files in a directory
export const listFiles = async (ip: string, path: string, pemFile?: File): Promise<FileItem[]> => {
  try {
    console.log("Fetching files from server:", ip, path);
    
    if (!pemFile || !(pemFile instanceof File)) {
      console.error('Invalid PEM file:', pemFile);
      throw new Error('PEM file is required and must be a File object');
    }
    
    const formData = createFormData({ ip, path, pemFile });
    
    // Log formData for debugging
    console.log('Sending FormData with keys:', [...formData.keys()]);
    
    const response = await fetch(`${API_BASE_URL}/list`, {
      method: 'POST',
      body: formData,
    });
    
    // Add detailed logging for debugging
    console.log('Response status:', response.status);
    
    const responseText = await response.text();
    console.log('Response text:', responseText);
    
    if (!response.ok) {
      console.error('Server error response:', responseText);
      try {
        const errorData = JSON.parse(responseText);
        throw new Error(errorData.error || 'Failed to list files');
      } catch (e) {
        throw new Error(`Failed to list files: ${responseText || response.statusText}`);
      }
    }
    
    if (!responseText) {
      throw new Error('Empty response from server');
    }
    
    try {
      const result: BackendResponse<FileItem[]> = JSON.parse(responseText);
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to list files');
      }
      
      return result.data;
    } catch (jsonError) {
      console.error('JSON parse error:', jsonError);
      throw new Error(`Invalid response format: ${jsonError.message}`);
    }
  } catch (error) {
    console.error('Error listing files:', error);
    throw error;
  }
};

// Create a new folder
export const createFolder = async (ip: string, path: string, folderName: string, pemFile?: File): Promise<void> => {
  try {
    console.log(`Creating folder: ${folderName} at ${path} on ${ip}`);
    
    const formData = createFormData(
      { ip, path, pemFile },
      { folderName }
    );
    
    const response = await fetch(`${API_BASE_URL}/createFolder`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create folder');
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to create folder');
    }
    
    return;
  } catch (error) {
    console.error('Error creating folder:', error);
    throw error;
  }
};

// Upload a file
export const uploadFile = async (ip: string, path: string, file: File, pemFile?: File): Promise<void> => {
  try {
    console.log(`Uploading file: ${file.name} to ${path} on ${ip}`);
    
    const formData = new FormData();
    formData.append('ip', ip);
    formData.append('path', path);
    if (pemFile) formData.append('pemFile', pemFile);
    formData.append('fileToUpload', file);
    
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to upload file');
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to upload file');
    }
    
    return;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Rename a file or folder
export const renameItem = async (ip: string, currentPath: string, oldName: string, newName: string, pemFile?: File): Promise<void> => {
  try {
    console.log(`Renaming: ${oldName} to ${newName} at ${currentPath} on ${ip}`);
    
    const formData = createFormData(
      { ip, pemFile },
      { currentPath, oldName, newName }
    );
    
    const response = await fetch(`${API_BASE_URL}/rename`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to rename item');
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to rename item');
    }
    
    return;
  } catch (error) {
    console.error('Error renaming item:', error);
    throw error;
  }
};

// Delete a file or folder
export const deleteItem = async (ip: string, path: string, pemFile?: File): Promise<void> => {
  try {
    console.log(`Deleting: ${path} on ${ip}`);
    
    // Determine if it's a directory based on path (this is just a guess, real implementation should have this info)
    const isDirectory = path.endsWith('/');
    
    const formData = createFormData(
      { ip, path, pemFile },
      { isDirectory: String(isDirectory) }
    );
    
    const response = await fetch(`${API_BASE_URL}/delete`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete item');
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete item');
    }
    
    return;
  } catch (error) {
    console.error('Error deleting item:', error);
    throw error;
  }
};

// Read file content
export const readFile = async (ip: string, path: string, pemFile?: File): Promise<string> => {
  try {
    console.log(`Reading file: ${path} on ${ip}`);
    
    const formData = createFormData({ ip, path, pemFile });
    
    const response = await fetch(`${API_BASE_URL}/readFile`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to read file');
    }
    
    const result: BackendResponse<string> = await response.json();
    
    if (!result.success || result.data === undefined) {
      throw new Error(result.error || 'Failed to read file');
    }
    
    return result.data;
  } catch (error) {
    console.error('Error reading file:', error);
    throw error;
  }
};

// Save file content
export const saveFile = async (ip: string, path: string, content: string, pemFile?: File): Promise<void> => {
  try {
    console.log(`Saving file: ${path} on ${ip} with content length: ${content.length}`);
    
    const formData = createFormData(
      { ip, path, pemFile },
      { content }
    );
    
    const response = await fetch(`${API_BASE_URL}/saveFile`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to save file');
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to save file');
    }
    
    return;
  } catch (error) {
    console.error('Error saving file:', error);
    throw error;
  }
};

// Update file permissions
export const updatePermissions = async (
  ip: string, 
  path: string, 
  permissions: FilePermissions, 
  pemFile?: File
): Promise<void> => {
  try {
    console.log(`Updating permissions for: ${path} on ${ip}`, permissions);
    
    const formData = createFormData(
      { ip, path, pemFile },
      { permissions }
    );
    
    const response = await fetch(`${API_BASE_URL}/permissions`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update permissions');
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to update permissions');
    }
    
    return;
  } catch (error) {
    console.error('Error updating permissions:', error);
    throw error;
  }
};

// Copy a file or folder
export const copyItem = async (
  ip: string,
  sourcePath: string,
  destinationPath: string,
  pemFile?: File
): Promise<void> => {
  try {
    console.log(`Copying: ${sourcePath} to ${destinationPath} on ${ip}`);
    
    const formData = createFormData(
      { ip, pemFile },
      { sourcePath, destinationPath }
    );
    
    const response = await fetch(`${API_BASE_URL}/copy`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to copy item');
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to copy item');
    }
    
    return;
  } catch (error) {
    console.error('Error copying item:', error);
    throw error;
  }
};

// Move a file or folder
export const moveItem = async (
  ip: string,
  sourcePath: string,
  destinationPath: string,
  pemFile?: File
): Promise<void> => {
  try {
    console.log(`Moving: ${sourcePath} to ${destinationPath} on ${ip}`);
    
    const formData = createFormData(
      { ip, pemFile },
      { sourcePath, destinationPath }
    );
    
    const response = await fetch(`${API_BASE_URL}/move`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to move item');
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to move item');
    }
    
    return;
  } catch (error) {
    console.error('Error moving item:', error);
    throw error;
  }
};
