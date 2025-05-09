import { FileItem, Site, ServerConnection, FilePermissions } from '@/types/server';

const API_BASE_URL = '/api';

// Global cache to simulate persistent server state during a session
let mockFileSystem = {
  '/var/www/': [
    {
      name: 'html',
      type: 'directory' as const,
      size: 0,
      modified: new Date().toISOString(),
      path: `/var/www/html`,
      permissions: {
        read: true,
        write: true,
        execute: true,
        owner: 'root',
        group: 'www-data'
      }
    },
    {
      name: 'cgi-bin',
      type: 'directory' as const,
      size: 0,
      modified: new Date().toISOString(),
      path: `/var/www/cgi-bin`,
      permissions: {
        read: true,
        write: true,
        execute: true,
        owner: 'root',
        group: 'www-data'
      }
    }
  ],
  '/var/www/html': [
    {
      name: 'wp.zyntr.com',
      type: 'directory' as const,
      size: 0,
      modified: new Date().toISOString(),
      path: `/var/www/html/wp.zyntr.com`,
      permissions: {
        read: true,
        write: true,
        execute: true,
        owner: 'www-data',
        group: 'www-data'
      }
    },
    {
      name: 'index.html',
      type: 'file' as const,
      size: 1024,
      modified: new Date().toISOString(),
      path: `/var/www/html/index.html`,
      permissions: {
        read: true,
        write: true,
        execute: false,
        owner: 'www-data',
        group: 'www-data'
      }
    },
    {
      name: 'favicon.ico',
      type: 'file' as const,
      size: 4096,
      modified: new Date().toISOString(),
      path: `/var/www/html/favicon.ico`,
      permissions: {
        read: true,
        write: true,
        execute: false,
        owner: 'www-data',
        group: 'www-data'
      }
    }
  ],
  '/var/www/html/wp.zyntr.com': [
    {
      name: 'wp-admin',
      type: 'directory' as const,
      size: 0,
      modified: new Date().toISOString(),
      path: `/var/www/html/wp.zyntr.com/wp-admin`,
      permissions: {
        read: true,
        write: true,
        execute: true,
        owner: 'www-data',
        group: 'www-data'
      }
    },
    {
      name: 'wp-content',
      type: 'directory' as const,
      size: 0,
      modified: new Date().toISOString(),
      path: `/var/www/html/wp.zyntr.com/wp-content`,
      permissions: {
        read: true,
        write: true,
        execute: true,
        owner: 'www-data',
        group: 'www-data'
      }
    },
    {
      name: 'wp-includes',
      type: 'directory' as const,
      size: 0,
      modified: new Date().toISOString(),
      path: `/var/www/html/wp.zyntr.com/wp-includes`,
      permissions: {
        read: true,
        write: true,
        execute: true,
        owner: 'www-data',
        group: 'www-data'
      }
    },
    {
      name: 'index.php',
      type: 'file' as const,
      size: 418,
      modified: new Date().toISOString(),
      path: `/var/www/html/wp.zyntr.com/index.php`,
      permissions: {
        read: true,
        write: true,
        execute: false,
        owner: 'www-data',
        group: 'www-data'
      }
    },
    {
      name: 'wp-config.php',
      type: 'file' as const,
      size: 2853,
      modified: new Date().toISOString(),
      path: `/var/www/html/wp.zyntr.com/wp-config.php`,
      permissions: {
        read: true,
        write: true,
        execute: false,
        owner: 'www-data',
        group: 'www-data'
      }
    },
    {
      name: '.htaccess',
      type: 'file' as const,
      size: 246,
      modified: new Date().toISOString(),
      path: `/var/www/html/wp.zyntr.com/.htaccess`,
      permissions: {
        read: true,
        write: true,
        execute: false,
        owner: 'www-data',
        group: 'www-data'
      }
    }
  ],
};

// File content cache
const fileContentCache: Record<string, string> = {};

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
    console.log("Fetching files from server:", ip, path);
    
    // Simulated delay to mimic network request
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Normalize path to ensure it works as a key
    const normalizedPath = path.endsWith('/') && path !== '/' ? path.slice(0, -1) : path;
    
    // Return cached files if we have them
    if (mockFileSystem[normalizedPath]) {
      return [...mockFileSystem[normalizedPath]];
    }
    
    // If path doesn't exist in our mock system, create an empty directory
    mockFileSystem[normalizedPath] = [];
    return [];
  } catch (error) {
    console.error('Error listing files:', error);
    throw error;
  }
};

// Create a new folder
export const createFolder = async (ip: string, path: string, folderName: string, pemFile?: File): Promise<void> => {
  try {
    console.log(`Creating folder: ${folderName} at ${path} on ${ip}`);
    
    // Simulated delay to mimic network request
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Normalize path
    const normalizedPath = path.endsWith('/') && path !== '/' ? path.slice(0, -1) : path;
    
    // Ensure the path exists in our mock system
    if (!mockFileSystem[normalizedPath]) {
      mockFileSystem[normalizedPath] = [];
    }
    
    // Create the new folder path
    const newFolderPath = `${normalizedPath}/${folderName}`;
    
    // Check if folder already exists
    const exists = mockFileSystem[normalizedPath].some(item => 
      item.name === folderName && item.type === 'directory'
    );
    
    if (exists) {
      throw new Error('Folder already exists');
    }
    
    // Add the new folder to the current directory
    mockFileSystem[normalizedPath].push({
      name: folderName,
      type: 'directory',
      size: 0,
      modified: new Date().toISOString(),
      path: newFolderPath
    });
    
    // Initialize the new folder with empty contents
    mockFileSystem[newFolderPath] = [];
    
    console.log('Folder created successfully');
    return Promise.resolve();
  } catch (error) {
    console.error('Error creating folder:', error);
    throw error;
  }
};

// Upload a file
export const uploadFile = async (ip: string, path: string, file: File, pemFile?: File): Promise<void> => {
  try {
    console.log(`Uploading file: ${file.name} to ${path} on ${ip}`);
    
    // Simulated delay proportional to file size
    await new Promise(resolve => setTimeout(resolve, file.size > 1000000 ? 3000 : 1000));
    
    // Normalize path
    const normalizedPath = path.endsWith('/') && path !== '/' ? path.slice(0, -1) : path;
    
    // Ensure the path exists in our mock system
    if (!mockFileSystem[normalizedPath]) {
      mockFileSystem[normalizedPath] = [];
    }
    
    // Check if file already exists
    const existingIndex = mockFileSystem[normalizedPath].findIndex(item => 
      item.name === file.name && item.type === 'file'
    );
    
    const newFilePath = `${normalizedPath}/${file.name}`;
    
    // Update or add the file
    const newFile = {
      name: file.name,
      type: 'file' as const,
      size: file.size,
      modified: new Date().toISOString(),
      path: newFilePath
    };
    
    if (existingIndex >= 0) {
      mockFileSystem[normalizedPath][existingIndex] = newFile;
    } else {
      mockFileSystem[normalizedPath].push(newFile);
    }
    
    // Update file content if text file
    if (file.type.includes('text') || ['.txt', '.md', '.js', '.html', '.css', '.php', '.json'].some(ext => file.name.endsWith(ext))) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          fileContentCache[newFilePath] = e.target.result as string;
        }
      };
      reader.readAsText(file);
    }
    
    console.log('File uploaded successfully');
    return Promise.resolve();
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Rename a file or folder
export const renameItem = async (ip: string, path: string, oldName: string, newName: string, pemFile?: File): Promise<void> => {
  try {
    console.log(`Renaming: ${oldName} to ${newName} at ${path} on ${ip}`);
    
    // Simulated delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Normalize path
    const normalizedPath = path.endsWith('/') && path !== '/' ? path.slice(0, -1) : path;
    
    // Ensure the path exists in our mock system
    if (!mockFileSystem[normalizedPath]) {
      throw new Error('Directory not found');
    }
    
    // Find the item to rename
    const itemIndex = mockFileSystem[normalizedPath].findIndex(item => item.name === oldName);
    
    if (itemIndex < 0) {
      throw new Error('Item not found');
    }
    
    const item = mockFileSystem[normalizedPath][itemIndex];
    const oldItemPath = item.path;
    const newItemPath = `${normalizedPath}/${newName}`;
    
    // Update the item with the new name and path
    mockFileSystem[normalizedPath][itemIndex] = {
      ...item,
      name: newName,
      path: newItemPath,
      modified: new Date().toISOString()
    };
    
    // If it's a directory, update the mock file system keys
    if (item.type === 'directory') {
      // Create new key with the renamed directory
      mockFileSystem[newItemPath] = mockFileSystem[oldItemPath] || [];
      
      // Delete old key
      delete mockFileSystem[oldItemPath];
      
      // Update paths of all items inside the directory (recursive function would be needed for subdirectories)
      mockFileSystem[newItemPath].forEach(subItem => {
        subItem.path = subItem.path.replace(oldItemPath, newItemPath);
      });
    } else if (item.type === 'file' && fileContentCache[oldItemPath]) {
      // Update file content cache for renamed files
      fileContentCache[newItemPath] = fileContentCache[oldItemPath];
      delete fileContentCache[oldItemPath];
    }
    
    console.log('Item renamed successfully');
    return Promise.resolve();
  } catch (error) {
    console.error('Error renaming item:', error);
    throw error;
  }
};

// Delete a file or folder
export const deleteItem = async (ip: string, path: string, pemFile?: File): Promise<void> => {
  try {
    console.log(`Deleting: ${path} on ${ip}`);
    
    // Simulated delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Get parent directory path and item name
    const pathParts = path.split('/').filter(Boolean);
    const itemName = pathParts.pop() || '';
    const parentPath = '/' + pathParts.join('/');
    
    // Ensure the parent path exists in our mock system
    if (!mockFileSystem[parentPath]) {
      throw new Error('Parent directory not found');
    }
    
    // Find the item to delete
    const itemIndex = mockFileSystem[parentPath].findIndex(item => item.name === itemName);
    
    if (itemIndex < 0) {
      throw new Error('Item not found');
    }
    
    const item = mockFileSystem[parentPath][itemIndex];
    
    // Remove the item from the parent directory
    mockFileSystem[parentPath].splice(itemIndex, 1);
    
    // If it's a directory, clean up the mock file system
    if (item.type === 'directory') {
      // This is simplified - a real implementation would recursively delete subdirectories
      delete mockFileSystem[path];
    }
    
    // Remove from file content cache if it's a file
    if (item.type === 'file') {
      delete fileContentCache[path];
    }
    
    console.log('Item deleted successfully');
    return Promise.resolve();
  } catch (error) {
    console.error('Error deleting item:', error);
    throw error;
  }
};

// Read file content
export const readFile = async (ip: string, path: string, pemFile?: File): Promise<string> => {
  try {
    console.log(`Reading file: ${path} on ${ip}`);
    
    // Simulated delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if we have cached content for this file
    if (fileContentCache[path]) {
      return fileContentCache[path];
    }
    
    // Generate mock content based on file extension
    const ext = path.split('.').pop()?.toLowerCase();
    let content = '';
    
    if (ext === 'html') {
      content = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Example Page</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header>
    <h1>Welcome to My Website</h1>
    <nav>
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/about">About</a></li>
        <li><a href="/contact">Contact</a></li>
      </ul>
    </nav>
  </header>
  <main>
    <p>This is a sample HTML file from ${path}</p>
  </main>
  <footer>
    <p>&copy; 2025 My Website</p>
  </footer>
</body>
</html>`;
    } else if (ext === 'css') {
      content = `/* Main styles for ${path} */
body {
  font-family: Arial, sans-serif;
  line-height: 1.6;
  margin: 0;
  padding: 0;
  color: #333;
}

header {
  background-color: #f4f4f4;
  padding: 1rem;
}

nav ul {
  display: flex;
  list-style: none;
}

nav ul li {
  margin-right: 1rem;
}

footer {
  background-color: #f4f4f4;
  padding: 1rem;
  text-align: center;
}`;
    } else if (ext === 'js') {
      content = `// JavaScript code for ${path}
document.addEventListener('DOMContentLoaded', () => {
  console.log('Document loaded');
  
  // Example function
  function greet(name) {
    return \`Hello, \${name}!\`;
  }
  
  console.log(greet('User'));
  
  // Add event listeners
  const buttons = document.querySelectorAll('button');
  buttons.forEach(button => {
    button.addEventListener('click', (e) => {
      console.log('Button clicked', e.target);
    });
  });
});`;
    } else if (ext === 'php') {
      content = `<?php
/**
 * Example PHP file for ${path}
 */

// Define a simple function
function sayHello($name) {
  return "Hello, " . $name . "!";
}

// Database connection example
$servername = "localhost";
$username = "username";
$password = "password";
$dbname = "myDB";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}
echo "Connected successfully";

// Sample query
$sql = "SELECT id, firstname, lastname FROM MyGuests";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
  // Output data of each row
  while($row = $result->fetch_assoc()) {
    echo "id: " . $row["id"] . " - Name: " . $row["firstname"] . " " . $row["lastname"] . "<br>";
  }
} else {
  echo "0 results";
}
$conn->close();
?>`;
    } else if (ext === 'json') {
      content = `{
  "name": "example-project",
  "version": "1.0.0",
  "description": "Example JSON file for ${path}",
  "main": "index.js",
  "scripts": {
    "test": "echo \\"Error: no test specified\\" && exit 1",
    "start": "node index.js"
  },
  "keywords": [
    "example",
    "demo"
  ],
  "author": "User",
  "license": "MIT",
  "dependencies": {
    "express": "^4.17.1",
    "lodash": "^4.17.21"
  }
}`;
    } else if (ext === 'md') {
      content = `# Example Markdown File

## Introduction
This is an example markdown file for ${path}.

## Features
- Simple formatting
- Easy to read
- Supports headings, lists, and more

## Code Example
\`\`\`javascript
function hello() {
  console.log("Hello, world!");
}
\`\`\`

## Conclusion
Markdown is a lightweight markup language that is easy to read and write.`;
    } else {
      content = `This is a mock content for ${path}. In a real implementation, this would be the actual content of the file retrieved from the server.

This file is being edited through the SSH File Manager application.

File path: ${path}
Server IP: ${ip}`;
    }
    
    // Store the content in cache
    fileContentCache[path] = content;
    
    return content;
  } catch (error) {
    console.error('Error reading file:', error);
    throw error;
  }
};

// Save file content
export const saveFile = async (ip: string, path: string, content: string, pemFile?: File): Promise<void> => {
  try {
    console.log(`Saving file: ${path} on ${ip} with content length: ${content.length}`);
    
    // Simulated delay proportional to content size
    await new Promise(resolve => setTimeout(resolve, content.length > 10000 ? 2000 : 1000));
    
    // Update the file content in cache
    fileContentCache[path] = content;
    
    // Ensure the file exists in our mock file system
    // Get parent directory path and item name
    const pathParts = path.split('/').filter(Boolean);
    const fileName = pathParts.pop() || '';
    const parentPath = '/' + pathParts.join('/');
    
    // Check if file exists in parent directory
    if (mockFileSystem[parentPath]) {
      const fileIndex = mockFileSystem[parentPath].findIndex(item => 
        item.name === fileName && item.type === 'file'
      );
      
      if (fileIndex >= 0) {
        // Update the file's modified date
        mockFileSystem[parentPath][fileIndex].modified = new Date().toISOString();
      } else {
        // Add the file if it doesn't exist
        mockFileSystem[parentPath].push({
          name: fileName,
          type: 'file',
          size: content.length,
          modified: new Date().toISOString(),
          path: path
        });
      }
    }
    
    console.log('File saved successfully');
    return Promise.resolve();
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
    
    // Simulated delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Get parent directory path and item name
    const pathParts = path.split('/').filter(Boolean);
    const itemName = pathParts.pop() || '';
    const parentPath = '/' + pathParts.join('/');
    
    // Ensure the parent path exists in our mock system
    if (!mockFileSystem[parentPath]) {
      throw new Error('Parent directory not found');
    }
    
    // Find the item to update permissions
    const itemIndex = mockFileSystem[parentPath].findIndex(item => item.name === itemName);
    
    if (itemIndex < 0) {
      throw new Error('Item not found');
    }
    
    // Update the permissions
    mockFileSystem[parentPath][itemIndex].permissions = permissions;
    // Update modified date
    mockFileSystem[parentPath][itemIndex].modified = new Date().toISOString();
    
    console.log('Permissions updated successfully');
    return Promise.resolve();
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
    
    // Simulated delay proportional to complexity
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Get source details
    const sourcePathParts = sourcePath.split('/').filter(Boolean);
    const sourceItemName = sourcePathParts.pop() || '';
    const sourceParentPath = '/' + sourcePathParts.join('/');
    
    // Get destination details
    const destPathParts = destinationPath.split('/').filter(Boolean);
    const destItemName = destPathParts.pop() || '';
    const destParentPath = '/' + destPathParts.join('/');
    
    // Ensure both paths exist
    if (!mockFileSystem[sourceParentPath]) {
      throw new Error('Source directory not found');
    }
    
    if (!mockFileSystem[destParentPath]) {
      mockFileSystem[destParentPath] = [];
    }
    
    // Find the source item
    const sourceItemIndex = mockFileSystem[sourceParentPath].findIndex(
      item => item.name === sourceItemName
    );
    
    if (sourceItemIndex < 0) {
      throw new Error('Source item not found');
    }
    
    const sourceItem = mockFileSystem[sourceParentPath][sourceItemIndex];
    
    // Check if destination already exists
    const destExists = mockFileSystem[destParentPath].some(
      item => item.name === destItemName
    );
    
    if (destExists) {
      throw new Error('Destination already exists');
    }
    
    // Create a copy of the item at the destination
    const newItem = {
      ...sourceItem,
      name: destItemName,
      path: destinationPath,
      modified: new Date().toISOString()
    };
    
    mockFileSystem[destParentPath].push(newItem);
    
    // If it's a directory, recursively copy its contents
    if (sourceItem.type === 'directory') {
      // Create new directory in mock file system
      mockFileSystem[destinationPath] = [];
      
      // If the source directory has contents, copy them
      if (mockFileSystem[sourcePath]) {
        mockFileSystem[destinationPath] = mockFileSystem[sourcePath].map(subItem => ({
          ...subItem,
          path: `${destinationPath}/${subItem.name}`,
          modified: new Date().toISOString()
        }));
      }
    } else if (sourceItem.type === 'file' && fileContentCache[sourcePath]) {
      // Copy file content if it exists in cache
      fileContentCache[destinationPath] = fileContentCache[sourcePath];
    }
    
    console.log('Item copied successfully');
    return Promise.resolve();
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
    
    // First copy the item to the destination
    await copyItem(ip, sourcePath, destinationPath, pemFile);
    
    // Then delete the original
    await deleteItem(ip, sourcePath, pemFile);
    
    console.log('Item moved successfully');
    return Promise.resolve();
  } catch (error) {
    console.error('Error moving item:', error);
    throw error;
  }
};
