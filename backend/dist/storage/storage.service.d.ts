import { ConfigService } from '@nestjs/config';
export declare class StorageService {
    private config;
    private readonly logger;
    private client;
    private container;
    constructor(config: ConfigService);
    upload(buffer: Buffer, originalName: string, mimeType: string): Promise<string>;
    delete(blobUrl: string): Promise<void>;
}
