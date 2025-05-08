
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
    console.log("Fetching files from server:", ip, path);
    
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
    console.log(`Creating folder: ${folderName} at ${path} on ${ip}`);
    // In a real implementation, this would call an API to create the folder
    // For now, we'll simulate with a delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In production, this would be an API call that creates a folder on the server
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
    // In a real implementation, this would upload the file to the server
    // For now, we'll simulate with a delay
    await new Promise(resolve => setTimeout(resolve, file.size > 1000000 ? 3000 : 1000));
    
    // In production, this would be an API call that uploads a file to the server
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
    // In a real implementation, this would rename the file or folder on the server
    // For now, we'll simulate with a delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In production, this would be an API call that renames a file or folder on the server
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
    // In a real implementation, this would delete the file or folder on the server
    // For now, we'll simulate with a delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In production, this would be an API call that deletes a file or folder on the server
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
    // In a real implementation, this would get the file content from the server
    // For now, we'll simulate with a delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
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
    // In a real implementation, this would save the file content to the server
    // For now, we'll simulate with a delay proportional to content size
    await new Promise(resolve => setTimeout(resolve, content.length > 10000 ? 2000 : 1000));
    
    // In production, this would be an API call that saves file content to the server
    console.log('File saved successfully');
    return Promise.resolve();
  } catch (error) {
    console.error('Error saving file:', error);
    throw error;
  }
};
