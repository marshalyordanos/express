// src/common/decorator/check-permission.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { PermissionActions } from 'src/contracts/permission-actions.enum';

export const PERMISSION_KEY = 'permissions';

/**
 * resource: string, e.g., 'User', 'Order'
 * actions: PermissionActions[], e.g., [PermissionActions.CREATE, PermissionActions.READ]
 */
export const CheckPermission = (resource: string, actions: PermissionActions) =>
  SetMetadata(PERMISSION_KEY, { resource, actions });
