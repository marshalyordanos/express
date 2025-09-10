import { IsNotEmpty, IsString, IsOptional } from "class-validator";

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

export interface BranchResponseDto {
  id: string;
  name: string;
  location: string;
  managerId?: string;
  createdAt: Date; // ISO date string
  updatedAt: Date; // ISO date string
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