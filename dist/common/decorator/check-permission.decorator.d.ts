import { PermissionActions } from 'src/contracts/permission-actions.enum';
export interface PermissionMeta {
    resource: string;
    action: PermissionActions;
    scope?: string;
}
export declare const PERMISSION_KEY = "permissions";
export declare const CheckPermission: (resource: string, action: PermissionActions, scopes?: string | string[]) => import("@nestjs/common").CustomDecorator<string>;
