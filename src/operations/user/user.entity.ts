import { Role } from '@prisma/client';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
} from 'class-validator';

export interface UserDto {
  name: string;
  email: string;
  password: string;
  role: Role; // SUPER_ADMIN, CUSTOMER, DRIVER etc.
  branchId?: string;
  phone?: string;
}

export class BranchCreateDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  location: string;

  @IsOptional()
  @IsString()
  managerId?: string;
}

export class BranchUpdateDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  managerId?: string;
}

export class BranchKpiDto {
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @IsNotEmpty()
  @IsDateString()
  endDate: string;
}
