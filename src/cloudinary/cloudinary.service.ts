import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  getMulterUploader(folder: string, transformations?: any) {
    const storage = new CloudinaryStorage({
      cloudinary,
      params: async (req, file) => ({
        folder,
        transformation: transformations ?? [],
      }),
    });

    return multer({ storage });
  }

  async uploadFile(file: Express.Multer.File, folder: string, transformations?: any) {
    const result = await cloudinary.uploader.upload(file.path, {
      folder,
      transformation: transformations ?? [],
    });
    return result.secure_url;
  }
}
