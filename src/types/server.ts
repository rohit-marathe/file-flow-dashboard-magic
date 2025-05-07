
export interface ServerConnection {
  ip: string;
  path: string;
  pemFile: File;
}

export interface Site {
  domain: string;
  ip: string;
}

export interface FileItem {
  name: string;
  type: 'file' | 'directory';
  size: number;
  modified: string;
  path: string;
}
