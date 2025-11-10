"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.profileUploader = exports.podUploader = void 0;
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const multer_1 = require("multer");
const cloudinary_config_1 = require("./cloudinary.config");
function createStorage(folder) {
    const storage = new multer_storage_cloudinary_1.CloudinaryStorage({
        cloudinary: cloudinary_config_1.default,
        params: async (req, file) => {
            return {
                folder,
                format: file.mimetype.split('/')[1],
                public_id: `${Date.now()}-${file.originalname}`,
            };
        },
    });
    return storage;
}
exports.podUploader = (0, multer_1.default)({ storage: createStorage('pod_images') });
exports.profileUploader = (0, multer_1.default)({ storage: createStorage('profile_pictures') });
//# sourceMappingURL=cloudinary.storage.js.map