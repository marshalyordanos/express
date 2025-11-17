"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WsPublic = exports.WS_PUBLIC_KEY = exports.Public = void 0;
const common_1 = require("@nestjs/common");
const Public = () => (0, common_1.SetMetadata)('isPublic', true);
exports.Public = Public;
exports.WS_PUBLIC_KEY = 'isPublicWs';
const WsPublic = () => (0, common_1.SetMetadata)(exports.WS_PUBLIC_KEY, true);
exports.WsPublic = WsPublic;
//# sourceMappingURL=public.decorator.js.map