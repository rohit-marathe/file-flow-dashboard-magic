
import { FileItem, Site, ServerConnection, FilePermissions, BackendResponse } from '@/types/server';

const API_BASE_URL = '/api';  // Using the proxy

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
    console.log("Adding PEM file to request:", connection.pemFile.name, connection.pemFile.size);
    formData.append('pemFile', connection.pemFile);
  } else {
    console.error('PEM file is missing or not a File object:', connection.pemFile);
    throw new Error('PEM file is required and must be a valid File object');
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

// Helper function for API requests with better error handling
const fetchWithErrorHandling = async (endpoint: string, options: RequestInit): Promise<any> => {
  try {
    console.log(`Making request to ${endpoint}`);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    
    console.log(`Response from ${endpoint}:`, response.status);
    
    // For non-200 responses, try to parse error
    if (!response.ok) {
      let errorMessage = `Server error: ${response.status} ${response.statusText}`;
      
      try {
        const textResponse = await response.text();
        console.log(`Error response body:`, textResponse);
        
        if (textResponse) {
          try {
            const errorData = JSON.parse(textResponse);
            errorMessage = errorData.error || errorMessage;
          } catch (e) {
            // If not valid JSON, use text as error
            errorMessage = textResponse || errorMessage;
          }
        }
      } catch (e) {
        console.error("Error parsing error response:", e);
      }
      
      throw new Error(errorMessage);
    }
    
    const responseText = await response.text();
    console.log(`Success response size:`, responseText.length);
    
    if (!responseText) {
      throw new Error('Empty response from server');
    }
    
    try {
      return JSON.parse(responseText);
    } catch (e) {
      console.error('Error parsing JSON response:', e);
      throw new Error(`Invalid JSON response: ${e.message}`);
    }
  } catch (error) {
    console.error(`API request to ${endpoint} failed:`, error);
    throw error;
  }
};

// List files in a directory
export const listFiles = async (ip: string, path: string, pemFile?: File): Promise<FileItem[]> => {
  try {
    console.log("Fetching files from server:", ip, path);
    
    if (!pemFile || !(pemFile instanceof File)) {
      console.error('Invalid PEM file:', pemFile);
      throw new Error('PEM file is required and must be a File object');
    }
    
    if (pemFile.size === 0) {
      throw new Error('PEM file is empty');
    }
    
    const formData = createFormData({ ip, path, pemFile });
    
    // Log formData for debugging
    console.log('Sending FormData with keys:', [...formData.keys()]);
    
    const result = await fetchWithErrorHandling('/list', {
      method: 'POST',
      body: formData,
    });
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to list files');
    }
    
    return result.data;
  } catch (error) {
    console.error('Error listing files:', error);
    throw error;
  }
};

// Get list of sites/domains
export const getSites = async (): Promise<Site[]> => {
  try {
    const result = await fetchWithErrorHandling('/sites', { method: 'GET' });
    return result.data || [];
  } catch (error) {
    console.error('Error fetching sites:', error);
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
    
    const result = await fetchWithErrorHandling('/createFolder', {
      method: 'POST',
      body: formData,
    });
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to create folder');
    }
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
    
    const result = await fetchWithErrorHandling('/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to upload file');
    }
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
    
    const result = await fetchWithErrorHandling('/rename', {
      method: 'POST',
      body: formData,
    });
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to rename item');
    }
  } catch (error) {
    console.error('Error renaming item:', error);
    throw error;
  }
};

// Delete a file or folder
export const deleteItem = async (ip: string, path: string, pemFile?: File, isDirectory: boolean = false): Promise<void> => {
  try {
    console.log(`Deleting: ${path} on ${ip} (isDirectory: ${isDirectory})`);
    
    const formData = createFormData(
      { ip, path, pemFile },
      { isDirectory: String(isDirectory) }
    );
    
    const result = await fetchWithErrorHandling('/delete', {
      method: 'POST',
      body: formData,
    });
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete item');
    }
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
    
    const result = await fetchWithErrorHandling('/readFile', {
      method: 'POST',
      body: formData,
    });
    
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
    
    const result = await fetchWithErrorHandling('/saveFile', {
      method: 'POST',
      body: formData,
    });
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to save file');
    }
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
    
    const result = await fetchWithErrorHandling('/permissions', {
      method: 'POST',
      body: formData,
    });
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to update permissions');
    }
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
    
    const result = await fetchWithErrorHandling('/copy', {
      method: 'POST',
      body: formData,
    });
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to copy item');
    }
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
    
    const result = await fetchWithErrorHandling('/move', {
      method: 'POST',
      body: formData,
    });
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to move item');
    }
  } catch (error) {
    console.error('Error moving item:', error);
    throw error;
  }
};
