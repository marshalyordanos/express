import { PrismaService } from '../prisma/prisma.service';
export declare class PermissionBootstrapper {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    private readonly defaultPermissions;
    run(): Promise<void>;
}
