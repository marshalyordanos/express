import { Readable } from 'stream';
export declare class CloudinaryUploaderService {
    private readonly logger;
    constructor();
    uploadFile(fileBufferOrStream: Buffer | Readable, folderPath: string): Promise<{
        url: string;
        publicId: string;
    }>;
    uploadFiles(files: (Buffer | Readable)[], folderPath: string): Promise<{
        url: string;
        publicId: string;
    }[]>;
}
