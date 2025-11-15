// cloudinary-uploader.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryUploaderService {
  private readonly logger = new Logger(CloudinaryUploaderService.name);

  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  /**
   * Uploads a file buffer or stream to Cloudinary
   * @param fileBufferOrStream - Buffer or Readable stream
   * @param folderPath - folder path in Cloudinary
   */
  async uploadFile(
    fileBufferOrStream: Buffer | Readable,
    folderPath: string,
  ): Promise<{ url: string; publicId: string }> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: folderPath, resource_type: 'image' },
        (err, result) => {
          if (err) return reject(err);
          resolve({ url: result.secure_url, publicId: result.public_id });
        },
      );

      if (Buffer.isBuffer(fileBufferOrStream)) {
        // TypeScript knows this is a Buffer now
        uploadStream.end(fileBufferOrStream);
      } else if (fileBufferOrStream instanceof Readable) {
        // TypeScript knows this is a stream now
        fileBufferOrStream.pipe(uploadStream);
      } else {
        reject(new Error('Invalid file type'));
      }
    });
  }
  /**
   * Upload multiple files at once
   */
  async uploadFiles(
    files: (Buffer | Readable)[],
    folderPath: string,
  ): Promise<{ url: string; publicId: string }[]> {
    const results = [];
    for (const file of files) {
      const uploaded = await this.uploadFile(file, folderPath);

      results.push(uploaded);
    }
    return results;
  }
}
