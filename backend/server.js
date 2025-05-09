const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { Client } = require('ssh2');
const bodyParser = require('body-parser');
const tmp = require('tmp');

const app = express();
const PORT = process.env.PORT || 3001;

// Improved CORS configuration
app.use(cors({
  origin: ['http://localhost:8080', 'http://127.0.0.1:8080', 'https://1cd50fc7-8147-44c3-b64a-bda502db9211.lovableproject.com'],
  credentials: true
}));

// Configure middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Set up multer for file uploads - with error handling
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create uploads directory if it doesn't exist
    const dir = './uploads';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Debug middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Store active SSH connections
const sshConnections = new Map();

// Helper function to get or create SSH connection
const getSSHConnection = async (ip, username, port, privateKey) => {
  const connectionKey = `${username}@${ip}:${port}`;
  
  // Check if we already have an active connection
  if (sshConnections.has(connectionKey)) {
    return sshConnections.get(connectionKey);
  }
  
  // Create a new connection
  return new Promise((resolve, reject) => {
    const conn = new Client();
    
    conn.on('ready', () => {
      console.log(`SSH connection established to ${connectionKey}`);
      
      // Add connection to the map
      sshConnections.set(connectionKey, conn);
      resolve(conn);
    });
    
    conn.on('error', (err) => {
      console.error(`SSH connection error for ${connectionKey}:`, err);
      reject(err);
    });
    
    // Connect with the provided credentials
    conn.connect({
      host: ip,
      port: port || 22,
      username,
      privateKey,
      readyTimeout: 10000,
    });
  });
};

// Close SSH connection
const closeSSHConnection = (ip, username, port) => {
  const connectionKey = `${username}@${ip}:${port}`;
  const conn = sshConnections.get(connectionKey);
  
  if (conn) {
    conn.end();
    sshConnections.delete(connectionKey);
    console.log(`SSH connection closed for ${connectionKey}`);
    return true;
  }
  
  return false;
};

// List files in a directory
app.post('/api/list', upload.single('pemFile'), async (req, res) => {
  console.log('List files request received');
  
  // Check if pemFile was uploaded
  if (!req.file) {
    console.error('No PEM file uploaded');
    return res.status(400).json({
      success: false,
      error: 'PEM file is required'
    });
  }
  
  try {
    const { ip, username = 'root', port = 22, path: remotePath } = req.body;
    console.log(`Request parameters: IP=${ip}, User=${username}, Port=${port}, Path=${remotePath}`);
    
    if (!ip || !remotePath) {
      console.error('Missing required parameters');
      return res.status(400).json({
        success: false,
        error: 'IP address and path are required'
      });
    }
    
    // Get pemFile content from the uploaded file
    const privateKeyPath = req.file.path;
    if (!fs.existsSync(privateKeyPath)) {
      console.error('PEM file not found at path:', privateKeyPath);
      return res.status(500).json({
        success: false,
        error: 'PEM file upload failed'
      });
    }
    
    const privateKey = fs.readFileSync(privateKeyPath);
    
    try {
      console.log('Establishing SSH connection...');
      // Get or create SSH connection
      const conn = await getSSHConnection(ip, username, port, privateKey);
      
      // Execute SFTP operation
      conn.sftp((err, sftp) => {
        if (err) {
          console.error('SFTP error:', err);
          return res.status(500).json({
            success: false,
            error: `SFTP error: ${err.message}`
          });
        }
        
        console.log(`Reading directory: ${remotePath}`);
        sftp.readdir(remotePath, (err, list) => {
          if (err) {
            console.error('Directory listing error:', err);
            return res.status(500).json({
              success: false,
              error: `Failed to list directory: ${err.message}`
            });
          }
          
          if (!list || !Array.isArray(list)) {
            console.error('Invalid list response:', list);
            return res.status(500).json({
              success: false,
              error: 'Invalid directory listing response'
            });
          }
          
          console.log(`Found ${list.length} items in directory`);
          
          // Process the list into our FileItem format
          const files = list.map(item => {
            const isDirectory = item.longname.charAt(0) === 'd';
            const permissions = {
              read: item.longname.charAt(1) === 'r',
              write: item.longname.charAt(2) === 'w',
              execute: item.longname.charAt(3) === 'x',
              owner: item.longname.split(' ')[2] || 'unknown',
              group: item.longname.split(' ')[3] || 'unknown',
            };
            
            // Handle path joining correctly
            let fullPath = remotePath;
            if (!fullPath.endsWith('/')) fullPath += '/';
            fullPath += item.filename;
            
            return {
              name: item.filename,
              type: isDirectory ? 'directory' : 'file',
              size: item.attrs.size || 0,
              modified: new Date(item.attrs.mtime * 1000).toISOString(),
              path: fullPath,
              permissions,
            };
          });
          
          // Clean up the uploaded file
          try {
            fs.unlinkSync(req.file.path);
          } catch (unlinkErr) {
            console.error('Error deleting PEM file:', unlinkErr);
          }
          
          // Send the response
          const response = {
            success: true,
            data: files
          };
          
          console.log('Sending response');
          res.json(response);
        });
      });
    } catch (sshError) {
      console.error('SSH connection error:', sshError);
      
      // Clean up the uploaded file
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkErr) {
        console.error('Error deleting PEM file:', unlinkErr);
      }
      
      res.status(500).json({
        success: false,
        error: `SSH connection failed: ${sshError.message}`
      });
    }
  } catch (error) {
    console.error('Error in list endpoint:', error);
    
    // Clean up the uploaded file if it exists
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkErr) {
        console.error('Error deleting PEM file:', unlinkErr);
      }
    }
    
    res.status(500).json({
      success: false,
      error: `Server error: ${error.message}`
    });
  }
});

// Create a new folder
app.post('/api/createFolder', upload.single('pemFile'), async (req, res) => {
  try {
    const { ip, username, port, path: remotePath, folderName } = req.body;
    const privateKey = fs.readFileSync(req.file.path);
    
    const conn = await getSSHConnection(ip, username, port || 22, privateKey);
    
    conn.sftp((err, sftp) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: `SFTP error: ${err.message}`
        });
      }
      
      let fullPath = remotePath;
      if (!fullPath.endsWith('/')) fullPath += '/';
      fullPath += folderName;
      
      sftp.mkdir(fullPath, (err) => {
        if (err) {
          return res.status(500).json({
            success: false,
            error: `Failed to create folder: ${err.message}`
          });
        }
        
        res.json({
          success: true,
          data: {
            name: folderName,
            path: fullPath,
            type: 'directory'
          }
        });
      });
    });
    
    // Clean up the uploaded file
    fs.unlinkSync(req.file.path);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Upload file
app.post('/api/upload', upload.fields([
  { name: 'pemFile', maxCount: 1 },
  { name: 'fileToUpload', maxCount: 1 }
]), async (req, res) => {
  try {
    const { ip, username, port, path: remotePath } = req.body;
    const privateKey = fs.readFileSync(req.files.pemFile[0].path);
    const fileToUpload = req.files.fileToUpload[0];
    
    const conn = await getSSHConnection(ip, username, port || 22, privateKey);
    
    conn.sftp((err, sftp) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: `SFTP error: ${err.message}`
        });
      }
      
      let fullPath = remotePath;
      if (!fullPath.endsWith('/')) fullPath += '/';
      fullPath += fileToUpload.originalname;
      
      // Create a read stream from the uploaded file and a write stream to the remote path
      const readStream = fs.createReadStream(fileToUpload.path);
      const writeStream = sftp.createWriteStream(fullPath);
      
      // Handle stream events
      writeStream.on('error', (error) => {
        return res.status(500).json({
          success: false,
          error: `Failed to upload file: ${error.message}`
        });
      });
      
      writeStream.on('close', () => {
        // Clean up uploaded files
        fs.unlinkSync(req.files.pemFile[0].path);
        fs.unlinkSync(fileToUpload.path);
        
        res.json({
          success: true,
          data: {
            name: fileToUpload.originalname,
            path: fullPath,
            size: fileToUpload.size,
            type: 'file'
          }
        });
      });
      
      // Pipe the file to the remote server
      readStream.pipe(writeStream);
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Read file content
app.post('/api/readFile', upload.single('pemFile'), async (req, res) => {
  try {
    const { ip, username, port, path: remotePath } = req.body;
    const privateKey = fs.readFileSync(req.file.path);
    
    const conn = await getSSHConnection(ip, username, port || 22, privateKey);
    
    conn.sftp((err, sftp) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: `SFTP error: ${err.message}`
        });
      }
      
      // Create a temporary file to store the content
      const tempFile = tmp.fileSync();
      
      sftp.fastGet(remotePath, tempFile.name, (err) => {
        if (err) {
          tempFile.removeCallback();
          return res.status(500).json({
            success: false,
            error: `Failed to read file: ${err.message}`
          });
        }
        
        // Read the content from the temp file
        fs.readFile(tempFile.name, 'utf8', (err, data) => {
          tempFile.removeCallback();
          fs.unlinkSync(req.file.path);
          
          if (err) {
            return res.status(500).json({
              success: false,
              error: `Failed to read file content: ${err.message}`
            });
          }
          
          res.json({
            success: true,
            data
          });
        });
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Save file content
app.post('/api/saveFile', upload.single('pemFile'), async (req, res) => {
  try {
    const { ip, username, port, path: remotePath, content } = req.body;
    const privateKey = fs.readFileSync(req.file.path);
    
    // Create a temporary file with the content
    const tempFile = tmp.fileSync();
    fs.writeFileSync(tempFile.name, content);
    
    const conn = await getSSHConnection(ip, username, port || 22, privateKey);
    
    conn.sftp((err, sftp) => {
      if (err) {
        tempFile.removeCallback();
        return res.status(500).json({
          success: false,
          error: `SFTP error: ${err.message}`
        });
      }
      
      // Upload the temporary file to the remote path
      sftp.fastPut(tempFile.name, remotePath, (err) => {
        tempFile.removeCallback();
        fs.unlinkSync(req.file.path);
        
        if (err) {
          return res.status(500).json({
            success: false,
            error: `Failed to save file: ${err.message}`
          });
        }
        
        res.json({
          success: true,
          data: { path: remotePath }
        });
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Rename file/folder
app.post('/api/rename', upload.single('pemFile'), async (req, res) => {
  try {
    const { ip, username, port, currentPath, oldName, newName } = req.body;
    const privateKey = fs.readFileSync(req.file.path);
    
    const conn = await getSSHConnection(ip, username, port || 22, privateKey);
    
    conn.sftp((err, sftp) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: `SFTP error: ${err.message}`
        });
      }
      
      let oldPath = currentPath;
      if (!oldPath.endsWith('/')) oldPath += '/';
      oldPath += oldName;
      
      let newPath = currentPath;
      if (!newPath.endsWith('/')) newPath += '/';
      newPath += newName;
      
      sftp.rename(oldPath, newPath, (err) => {
        fs.unlinkSync(req.file.path);
        
        if (err) {
          return res.status(500).json({
            success: false,
            error: `Failed to rename: ${err.message}`
          });
        }
        
        res.json({
          success: true,
          data: { oldPath, newPath }
        });
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete file/folder
app.post('/api/delete', upload.single('pemFile'), async (req, res) => {
  try {
    const { ip, username, port, path: remotePath, isDirectory } = req.body;
    const privateKey = fs.readFileSync(req.file.path);
    
    const conn = await getSSHConnection(ip, username, port || 22, privateKey);
    
    conn.sftp((err, sftp) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: `SFTP error: ${err.message}`
        });
      }
      
      if (isDirectory === 'true') {
        // For directories, we need to execute an rm -rf command
        conn.exec(`rm -rf "${remotePath}"`, (err, stream) => {
          if (err) {
            return res.status(500).json({
              success: false,
              error: `Failed to delete directory: ${err.message}`
            });
          }
          
          let errorOutput = '';
          stream.on('data', (data) => {});
          stream.stderr.on('data', (data) => {
            errorOutput += data;
          });
          
          stream.on('close', (code) => {
            fs.unlinkSync(req.file.path);
            
            if (code !== 0) {
              return res.status(500).json({
                success: false,
                error: `Command failed with code ${code}: ${errorOutput}`
              });
            }
            
            res.json({
              success: true,
              data: { path: remotePath }
            });
          });
        });
      } else {
        // For files, we can use the unlink method
        sftp.unlink(remotePath, (err) => {
          fs.unlinkSync(req.file.path);
          
          if (err) {
            return res.status(500).json({
              success: false,
              error: `Failed to delete file: ${err.message}`
            });
          }
          
          res.json({
            success: true,
            data: { path: remotePath }
          });
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update permissions
app.post('/api/permissions', upload.single('pemFile'), async (req, res) => {
  try {
    const { ip, username, port, path: remotePath, permissions } = req.body;
    const privateKey = fs.readFileSync(req.file.path);
    const parsedPermissions = JSON.parse(permissions);
    
    const conn = await getSSHConnection(ip, username, port || 22, privateKey);
    
    // Calculate the chmod numeric mode
    let mode = 0;
    if (parsedPermissions.read) mode += 4;
    if (parsedPermissions.write) mode += 2;
    if (parsedPermissions.execute) mode += 1;
    
    // The full mode is user perms + group perms + others perms (simplified for this example)
    const fullMode = (mode * 100) + (mode * 10) + mode;
    
    // Execute chmod command
    conn.exec(`chmod ${fullMode} "${remotePath}" && chown ${parsedPermissions.owner}:${parsedPermissions.group} "${remotePath}"`, (err, stream) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: `Failed to update permissions: ${err.message}`
        });
      }
      
      let errorOutput = '';
      stream.on('data', (data) => {});
      stream.stderr.on('data', (data) => {
        errorOutput += data;
      });
      
      stream.on('close', (code) => {
        fs.unlinkSync(req.file.path);
        
        if (code !== 0) {
          return res.status(500).json({
            success: false,
            error: `Command failed with code ${code}: ${errorOutput}`
          });
        }
        
        res.json({
          success: true,
          data: {
            path: remotePath,
            permissions: parsedPermissions
          }
        });
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Copy file/directory
app.post('/api/copy', upload.single('pemFile'), async (req, res) => {
  try {
    const { ip, username, port, sourcePath, destinationPath } = req.body;
    const privateKey = fs.readFileSync(req.file.path);
    
    const conn = await getSSHConnection(ip, username, port || 22, privateKey);
    
    // Use cp command with the -r flag to copy directories recursively
    conn.exec(`cp -r "${sourcePath}" "${destinationPath}"`, (err, stream) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: `Failed to copy: ${err.message}`
        });
      }
      
      let errorOutput = '';
      stream.on('data', (data) => {});
      stream.stderr.on('data', (data) => {
        errorOutput += data;
      });
      
      stream.on('close', (code) => {
        fs.unlinkSync(req.file.path);
        
        if (code !== 0) {
          return res.status(500).json({
            success: false,
            error: `Command failed with code ${code}: ${errorOutput}`
          });
        }
        
        res.json({
          success: true,
          data: {
            sourcePath,
            destinationPath
          }
        });
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Move file/directory
app.post('/api/move', upload.single('pemFile'), async (req, res) => {
  try {
    const { ip, username, port, sourcePath, destinationPath } = req.body;
    const privateKey = fs.readFileSync(req.file.path);
    
    const conn = await getSSHConnection(ip, username, port || 22, privateKey);
    
    // Use mv command to move files/directories
    conn.exec(`mv "${sourcePath}" "${destinationPath}"`, (err, stream) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: `Failed to move: ${err.message}`
        });
      }
      
      let errorOutput = '';
      stream.on('data', (data) => {});
      stream.stderr.on('data', (data) => {
        errorOutput += data;
      });
      
      stream.on('close', (code) => {
        fs.unlinkSync(req.file.path);
        
        if (code !== 0) {
          return res.status(500).json({
            success: false,
            error: `Command failed with code ${code}: ${errorOutput}`
          });
        }
        
        res.json({
          success: true,
          data: {
            sourcePath,
            destinationPath
          }
        });
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Disconnect from SSH
app.post('/api/disconnect', (req, res) => {
  try {
    const { ip, username, port } = req.body;
    
    const result = closeSSHConnection(ip, username, port || 22);
    
    if (result) {
      res.json({
        success: true,
        message: 'Disconnected successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'No active connection found'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Simple health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Backend server is running',
    timestamp: new Date().toISOString()
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`SFTP backend server running on port ${PORT}`);
  console.log(`CORS enabled for: http://localhost:8080, http://127.0.0.1:8080, https://1cd50fc7-8147-44c3-b64a-bda502db9211.lovableproject.com`);
});

// Cleanup on process exit
process.on('exit', () => {
  // Close all SSH connections
  sshConnections.forEach((conn) => {
    try {
      conn.end();
    } catch (error) {
      console.error('Error closing connection:', error);
    }
  });
  
  // Clean up uploads directory
  try {
    const uploadsDir = './uploads';
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      files.forEach(file => {
        fs.unlinkSync(path.join(uploadsDir, file));
      });
    }
  } catch (error) {
    console.error('Error cleaning up uploads directory:', error);
  }
});

module.exports = app;
