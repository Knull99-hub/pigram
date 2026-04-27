"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseModule = exports.COSMOS_DB = exports.COSMOS_CLIENT = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const cosmos_1 = require("@azure/cosmos");
exports.COSMOS_CLIENT = 'COSMOS_CLIENT';
exports.COSMOS_DB = 'COSMOS_DB';
let DatabaseModule = class DatabaseModule {
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [
            {
                provide: exports.COSMOS_CLIENT,
                useFactory: (config) => new cosmos_1.CosmosClient({
                    endpoint: config.get('COSMOS_ENDPOINT', 'https://localhost:8081'),
                    key: config.get('COSMOS_KEY', 'dummy'),
                }),
                inject: [config_1.ConfigService],
            },
            {
                provide: exports.COSMOS_DB,
                useFactory: async (client, config) => {
                    const dbName = config.get('COSMOS_DATABASE', 'instagram');
                    const { database } = await client.databases.createIfNotExists({ id: dbName });
                    const containers = [
                        { id: 'users', partitionKey: '/id' },
                        { id: 'posts', partitionKey: '/creatorId' },
                        { id: 'comments', partitionKey: '/postId' },
                        { id: 'likes', partitionKey: '/postId' },
                        { id: 'saves', partitionKey: '/userId' },
                        { id: 'follows', partitionKey: '/followerId' },
                        { id: 'notifications', partitionKey: '/userId' },
                    ];
                    for (const c of containers) {
                        await database.containers.createIfNotExists({ id: c.id, partitionKey: c.partitionKey });
                    }
                    return database;
                },
                inject: [exports.COSMOS_CLIENT, config_1.ConfigService],
            },
        ],
        exports: [exports.COSMOS_CLIENT, exports.COSMOS_DB],
    })
], DatabaseModule);
//# sourceMappingURL=database.module.js.map