"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var StorageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const storage_blob_1 = require("@azure/storage-blob");
const uuid_1 = require("uuid");
let StorageService = StorageService_1 = class StorageService {
    config;
    logger = new common_1.Logger(StorageService_1.name);
    client = null;
    container;
    constructor(config) {
        this.config = config;
        this.container = config.get('AZURE_STORAGE_CONTAINER', 'media');
        const account = config.get('AZURE_STORAGE_ACCOUNT', '');
        const key = config.get('AZURE_STORAGE_KEY', '');
        if (account && key) {
            const cred = new storage_blob_1.StorageSharedKeyCredential(account, key);
            this.client = new storage_blob_1.BlobServiceClient(`https://${account}.blob.core.windows.net`, cred);
        }
        else {
            this.logger.warn('Azure Storage not configured — uploads will be skipped');
        }
    }
    async upload(buffer, originalName, mimeType) {
        if (!this.client) {
            const placeholder = `https://picsum.photos/seed/${(0, uuid_1.v4)()}/800/800`;
            this.logger.warn(`Storage not configured, returning placeholder: ${placeholder}`);
            return placeholder;
        }
        const ext = originalName.split('.').pop() ?? 'jpg';
        const blobName = `${(0, uuid_1.v4)()}.${ext}`;
        const containerClient = this.client.getContainerClient(this.container);
        await containerClient.createIfNotExists({ access: 'blob' });
        const blockClient = containerClient.getBlockBlobClient(blobName);
        await blockClient.uploadData(buffer, {
            blobHTTPHeaders: { blobContentType: mimeType },
        });
        return blockClient.url;
    }
    async delete(blobUrl) {
        if (!this.client)
            return;
        try {
            const url = new URL(blobUrl);
            const blobName = url.pathname.split('/').slice(2).join('/');
            const containerClient = this.client.getContainerClient(this.container);
            await containerClient.getBlockBlobClient(blobName).deleteIfExists();
        }
        catch {
            this.logger.warn(`Failed to delete blob: ${blobUrl}`);
        }
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = StorageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], StorageService);
//# sourceMappingURL=storage.service.js.map