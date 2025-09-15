import { IsNotEmpty, IsString } from 'class-validator';

export interface UserDto {
  name: string;
  email: string;
  password: string;
  role: string; // SUPER_ADMIN, CUSTOMER, DRIVER etc.
  branchId?: string;
  phone?: string;
}

export class UserUpdateDto{
  name: string;
  email: string;
  password: string;
  branchId?: string;
  phone?: string;
}

export class ChangeRoleDto {
  @IsNotEmpty()
  @IsString()
  role: string;
  
  @IsNotEmpty()
  @IsString()
  userId: string;
}
