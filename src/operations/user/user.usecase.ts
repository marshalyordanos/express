import { UserDto } from './user.entity';
import { User } from '@prisma/client';

export interface UserUsecase {
  findUserById(id: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  updateUser(id: string, data: Partial<UserDto>): Promise<User>;
  deleteUser(id: string): Promise<User>;
}
