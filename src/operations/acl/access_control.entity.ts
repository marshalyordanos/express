import { Transform, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { escape } from 'lodash';

export class PermissionDto {
  @IsString()
  @IsNotEmpty({ message: 'Resource is required!!' })
  resource: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class RoleDto {
  @IsString()
  @IsNotEmpty({ message: 'Role name is required' })
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @IsOptional()
  permissions: PermissionDto[];
}

// DTOs
export class PermissionActionDto {
  @IsString()
  permissionId: string;

  @IsOptional()
  @IsBoolean()
  createAction?: boolean;

  @IsOptional()
  @IsBoolean()
  readAction?: boolean;

  @IsOptional()
  @IsBoolean()
  updateAction?: boolean;

  @IsOptional()
  @IsBoolean()
  deleteAction?: boolean;

  @IsArray()
  @IsOptional()
  scopes?: string[];
}


export class ChangeRolePermissionDto {
  @IsString()
  @IsNotEmpty({ message: 'Role ID is required' })
  roleId: string;

  @IsOptional()
  @ValidateNested({ each: true }) // important for arrays of objects
  @Type(() => PermissionActionDto) // tells class-transformer how to transform nested objects
  permissions?: PermissionActionDto[];
}

export class RemovePermissionDto {
  @IsNotEmpty({ message: 'permissionId is required' })
  @IsString()
  @Transform(({ value }) => escape(value.trim()))
  permissionId: string;
}

export class AssignUserRoleDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  roleId: string;
}
