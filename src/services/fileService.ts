
import axios from 'axios';

const API_BASE_URL = '/api';

export interface FileItem {
  name: string;
  type: 'file' | 'directory';
  size: number;
  modified: string;
  path: string;
}

export interface Site {
  domain: string;
  ip: string;
}

// Get list of sites/domains
export const getSites = async (): Promise<Site[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/sites`);
    return response.data;
  } catch (error) {
    console.error('Error fetching sites:', error);
    throw error;
  }
};

// List files in a directory
export const listFiles = async (ip: string, path: string): Promise<FileItem[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/files`, {
      params: { ip, path }
    });
    return response.data;
  } catch (error) {
    console.error('Error listing files:', error);
    throw error;
  }
};

// Create a new folder
export const createFolder = async (ip: string, path: string, folderName: string): Promise<void> => {
  try {
    await axios.post(`${API_BASE_URL}/files/create-folder`, {
      ip,
      path,
      folder_name: folderName
    });
  } catch (error) {
    console.error('Error creating folder:', error);
    throw error;
  }
};

// Upload a file
export const uploadFile = async (ip: string, path: string, file: File): Promise<void> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('ip', ip);
    formData.append('path', path);
    
    await axios.post(`${API_BASE_URL}/files/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Rename a file or folder
export const renameItem = async (ip: string, path: string, oldName: string, newName: string): Promise<void> => {
  try {
    await axios.post(`${API_BASE_URL}/files/rename`, {
      ip,
      path,
      old_name: oldName,
      new_name: newName
    });
  } catch (error) {
    console.error('Error renaming item:', error);
    throw error;
  }
};

// Delete a file or folder
export const deleteItem = async (ip: string, path: string): Promise<void> => {
  try {
    await axios.post(`${API_BASE_URL}/files/delete`, {
      ip,
      path
    });
  } catch (error) {
    console.error('Error deleting item:', error);
    throw error;
  }
};

// Read file content
export const readFile = async (ip: string, path: string): Promise<string> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/files/read`, {
      params: { ip, path }
    });
    return response.data.content;
  } catch (error) {
    console.error('Error reading file:', error);
    throw error;
  }
};

// Save file content
export const saveFile = async (ip: string, path: string, content: string): Promise<void> => {
  try {
    await axios.post(`${API_BASE_URL}/files/save`, {
      ip,
      path,
      content
    });
  } catch (error) {
    console.error('Error saving file:', error);
    throw error;
  }
};
