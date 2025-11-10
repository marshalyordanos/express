"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var CloudinaryUploaderService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudinaryUploaderService = void 0;
const common_1 = require("@nestjs/common");
const cloudinary_1 = require("cloudinary");
const stream_1 = require("stream");
let CloudinaryUploaderService = CloudinaryUploaderService_1 = class CloudinaryUploaderService {
    constructor() {
        this.logger = new common_1.Logger(CloudinaryUploaderService_1.name);
        cloudinary_1.v2.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
    }
    async uploadFile(fileBufferOrStream, folderPath) {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary_1.v2.uploader.upload_stream({ folder: folderPath, resource_type: 'image' }, (err, result) => {
                if (err)
                    return reject(err);
                resolve({ url: result.secure_url, publicId: result.public_id });
            });
            if (Buffer.isBuffer(fileBufferOrStream)) {
                uploadStream.end(fileBufferOrStream);
            }
            else if (fileBufferOrStream instanceof stream_1.Readable) {
                fileBufferOrStream.pipe(uploadStream);
            }
            else {
                reject(new Error('Invalid file type'));
            }
        });
    }
    async uploadFiles(files, folderPath) {
        const results = [];
        for (const file of files) {
            const uploaded = await this.uploadFile(file, folderPath);
            results.push(uploaded);
        }
        return results;
    }
};
exports.CloudinaryUploaderService = CloudinaryUploaderService;
exports.CloudinaryUploaderService = CloudinaryUploaderService = CloudinaryUploaderService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], CloudinaryUploaderService);
//# sourceMappingURL=cloudinary-uploader.service.js.map