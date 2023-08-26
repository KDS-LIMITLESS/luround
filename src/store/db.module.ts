import { DynamicModule, Global, Module } from '@nestjs/common';
import { MongoClient } from 'mongodb';


@Global()
@Module({})
export class MongoModule {

  static registerAsync(): DynamicModule {
    const database = {
      provide: 'MONGO_CONNECTION',
      useFactory: async function() {
        const client = new MongoClient(process.env.MONGO_ATLAS_DB, {
          maxPoolSize: 100,
          minPoolSize: 0,
          maxIdleTimeMS: 1000,
          socketTimeoutMS: 8000
        });

        client.on("connectionCreated", function(pool) {
          console.log("Connected to database >>>>> " + pool.connectionId)
        })
        
        await client.connect();
        return client.db(); // Database instance
      },
    };

    return {
      module: MongoModule,
      providers: [database],
      exports: [database],
    };
  }
}