import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CosmosClient } from '@azure/cosmos';

export const COSMOS_CLIENT = 'COSMOS_CLIENT';
export const COSMOS_DB = 'COSMOS_DB';

@Global()
@Module({
  providers: [
    {
      provide: COSMOS_CLIENT,
      useFactory: (config: ConfigService) =>
        new CosmosClient({
          endpoint: config.get<string>('COSMOS_ENDPOINT', 'https://localhost:8081'),
          key: config.get<string>('COSMOS_KEY', 'dummy'),
        }),
      inject: [ConfigService],
    },
    {
      provide: COSMOS_DB,
      useFactory: async (client: CosmosClient, config: ConfigService) => {
        const dbName = config.get<string>('COSMOS_DATABASE', 'instagram');
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
      inject: [COSMOS_CLIENT, ConfigService],
    },
  ],
  exports: [COSMOS_CLIENT, COSMOS_DB],
})
export class DatabaseModule {}
