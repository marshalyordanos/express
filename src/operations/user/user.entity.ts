import { Role } from '@prisma/client';

export interface UserDto {
  name: string;
  email: string;
  password: string;
  role: Role; // SUPER_ADMIN, CUSTOMER, DRIVER etc.
  branchId?: string;
  phone?: string;
}
