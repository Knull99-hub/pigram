import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BlobServiceClient, StorageSharedKeyCredential } from '@azure/storage-blob';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private client: BlobServiceClient | null = null;
  private container: string;

  constructor(private config: ConfigService) {
    this.container = config.get<string>('AZURE_STORAGE_CONTAINER', 'media');
    const account = config.get<string>('AZURE_STORAGE_ACCOUNT', '');
    const key = config.get<string>('AZURE_STORAGE_KEY', '');

    if (account && key) {
      const cred = new StorageSharedKeyCredential(account, key);
      this.client = new BlobServiceClient(`https://${account}.blob.core.windows.net`, cred);
    } else {
      this.logger.warn('Azure Storage not configured — uploads will be skipped');
    }
  }

  async upload(buffer: Buffer, originalName: string, mimeType: string): Promise<string> {
    if (!this.client) {
      const placeholder = `https://picsum.photos/seed/${uuidv4()}/800/800`;
      this.logger.warn(`Storage not configured, returning placeholder: ${placeholder}`);
      return placeholder;
    }

    const ext = originalName.split('.').pop() ?? 'jpg';
    const blobName = `${uuidv4()}.${ext}`;
    const containerClient = this.client.getContainerClient(this.container);
    await containerClient.createIfNotExists({ access: 'blob' });

    const blockClient = containerClient.getBlockBlobClient(blobName);
    await blockClient.uploadData(buffer, {
      blobHTTPHeaders: { blobContentType: mimeType },
    });

    return blockClient.url;
  }

  async delete(blobUrl: string): Promise<void> {
    if (!this.client) return;
    try {
      const url = new URL(blobUrl);
      const blobName = url.pathname.split('/').slice(2).join('/');
      const containerClient = this.client.getContainerClient(this.container);
      await containerClient.getBlockBlobClient(blobName).deleteIfExists();
    } catch {
      this.logger.warn(`Failed to delete blob: ${blobUrl}`);
    }
  }
}
