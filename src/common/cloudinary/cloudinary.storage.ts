import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import cloudinary from '../cloudinary.config';
import { UploadApiOptions } from 'cloudinary';

function createStorage(folder: string) {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file): Promise<UploadApiOptions> => {
      return {
        folder, // folder name in Cloudinary
        format: file.mimetype.split('/')[1], // jpg, png, etc
        public_id: `${Date.now()}-${file.originalname}`, // optional unique filename
      };
    },
  });

  return storage;
}

// POD images
export const podUploader = multer({ storage: createStorage('pod_images') });

// Profile pictures
export const profileUploader = multer({ storage: createStorage('profile_pictures') });
