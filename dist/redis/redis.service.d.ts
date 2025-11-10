import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { RedisClientType } from 'redis';
export declare class RedisService implements OnModuleInit, OnModuleDestroy {
    private client;
    client2: RedisClientType;
    private readyPromise;
    onModuleInit(): Promise<void>;
    set(key: string, value: string, options?: {
        EX?: number;
    }): Promise<string | {}>;
    get(key: string): Promise<string | {}>;
    gets(key: string): Promise<string | null>;
    del(key: string): Promise<number>;
    waitUntilReady(): Promise<void>;
    getClient(): RedisClientType;
    onModuleDestroy(): Promise<void>;
}
