import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  IsIn,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';

export class RegisterStaffDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  branchId?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

export class UpdateStaffDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsEmail({}, { message: 'Invalid email format' })
  @IsOptional()
  email: string;

  @IsOptional()
  @IsString()
  branchId?: string;

  @IsOptional()
  @IsString()
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

export class AssignStaffToBranchDto {
  @IsArray({ message: 'staffIds must be an array of strings' })
  @ArrayNotEmpty({ message: 'staffIds cannot be empty' })
  @IsString({ each: true, message: 'Each staffId must be a string' })
  staffIds: string[];

  @IsNotEmpty({ message: 'branchId is required' })
  @IsString({ message: 'branchId must be a string' })
  branchId: string;
}