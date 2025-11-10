"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckPermission = exports.PERMISSION_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.PERMISSION_KEY = 'permissions';
const CheckPermission = (resource, action, scopes) => (0, common_1.SetMetadata)(exports.PERMISSION_KEY, { resource, action, scopes });
exports.CheckPermission = CheckPermission;
//# sourceMappingURL=check-permission.decorator.js.map