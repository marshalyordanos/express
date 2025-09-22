import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RoleCreateDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  // @IsNotEmpty()

  @IsString()
  description?: string;
}

export class RoleResponseDto {
  id: string;
  name: string;
  description: string;
}
export class RoleUpdateDto {
  @IsOptional()
  @IsString()
  name: string;
  @IsOptional()
  @IsString()
  description: string;
}

export enum Role {
  //   SUPER_ADMIN = 'SUPER_ADMIN',
  BRANCH_MANAGER = 'BRANCH_MANAGER',
  DISPATCH_OFFICER = 'DISPATCH_OFFICER',
  //   AGENT = 'AGENT',
  DRIVER = 'DRIVER',
  CUSTOMER = 'CUSTOMER',
  CUSTOMER_SERVICE = 'CUSTOMER_SERVICE',
}
