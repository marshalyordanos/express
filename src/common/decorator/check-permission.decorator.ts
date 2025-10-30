import { SetMetadata } from '@nestjs/common';
import { PermissionActions } from 'src/contracts/permission-actions.enum';

export interface PermissionMeta {
  resource: string;
  action: PermissionActions;
  scope?: string; // optional sub-action or endpoint tag
}

export const PERMISSION_KEY = 'permissions';
export const CheckPermission = (
  resource: string,
  action: PermissionActions,
  scopes?: string | string[], // optional sub-action or endpoint tag
) => SetMetadata(PERMISSION_KEY, { resource, action, scopes });
