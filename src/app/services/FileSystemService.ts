
export interface FileSystemHandle {
  kind: 'file' | 'directory';
  name: string;
}

export interface FileSystemDirectoryHandle extends FileSystemHandle {
  kind: 'directory';
  getFileHandle(name: string, options?: { create?: boolean }): Promise<FileSystemFileHandle>;
  getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<FileSystemDirectoryHandle>;
}

export interface FileSystemFileHandle extends FileSystemHandle {
  kind: 'file';
  createWritable(): Promise<FileSystemWritableFileStream>;
}

export interface FileSystemWritableFileStream extends WritableStream {
  write(data: any): Promise<void>;
  close(): Promise<void>;
}

export class FileSystemService {
  private rootHandle: FileSystemDirectoryHandle | null = null;

  async selectDirectory(): Promise<boolean> {
    try {
      // @ts-ignore - verify API availability
      this.rootHandle = await window.showDirectoryPicker();
      return true;
    } catch (error) {
      console.error('Error selecting directory:', error);
      return false;
    }
  }

  isReady(): boolean {
    return this.rootHandle !== null;
  }

  async saveVerification(data: any, originalFile: File | null): Promise<void> {
    if (!this.rootHandle) throw new Error('No workspace selected');

    try {
      const verDir = await this.rootHandle.getDirectoryHandle('verifications', { create: true });
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const folderName = `ver_${timestamp}`;
      const caseDir = await verDir.getDirectoryHandle(folderName, { create: true });

      // Save JSON data
      const jsonHandle = await caseDir.getFileHandle('report.json', { create: true });
      const writable = await jsonHandle.createWritable();
      await writable.write(JSON.stringify(data, null, 2));
      await writable.close();

      // Save original image if available
      if (originalFile) {
        const imageHandle = await caseDir.getFileHandle(originalFile.name, { create: true });
        const imageWritable = await imageHandle.createWritable();
        await imageWritable.write(originalFile);
        await imageWritable.close();
      }
    } catch (error) {
      console.error('Error saving verification:', error);
      throw error;
    }
  }

  async saveDataset(dataset: any[]): Promise<void> {
    if (!this.rootHandle) throw new Error('No workspace selected');

    try {
      const dataDir = await this.rootHandle.getDirectoryHandle('datasets', { create: true });
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `dataset_${timestamp}.json`;
      
      const fileHandle = await dataDir.getFileHandle(filename, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(JSON.stringify(dataset, null, 2));
      await writable.close();
    } catch (error) {
      console.error('Error saving dataset:', error);
      throw error;
    }
  }
}

export const fileSystemService = new FileSystemService();
