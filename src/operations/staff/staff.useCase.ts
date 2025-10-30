import { Prisma, User } from '@prisma/client';
import { ChangeRoleDto } from '../user/user.entity';
import { RegisterStaffDto,UpdateStaffDto } from './staff.entity';
import { ListQueryDto } from '../../common/query/query.dto';

export interface StaffUsecase {
  changeUserRole(data: ChangeRoleDto): Promise<User>;
  createStaff(data: RegisterStaffDto, email: string): Promise<User>;
  findStaffByRole(query: ListQueryDto, role: string): Promise<any>;
  findAllStaff(
    query: ListQueryDto
  ): Promise<any>;
//   findUserByEmail(email: string): Promise<User | null>;

deleteStaff(id: string): Promise<string>;
findStaffById(id: string): Promise<User>;
updateStaff(id: string, data: UpdateStaffDto): Promise<User>;
findStaffByBranch( query: ListQueryDto, branchId: string): Promise<any>;
assignStaffToBranch(staffIds: string[], branchId: string): Promise<Prisma.BatchPayload>;
}
