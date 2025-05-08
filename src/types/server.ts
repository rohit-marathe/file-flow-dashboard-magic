
export interface ServerConnection {
  ip: string;
  username?: string;
  port?: number;
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
