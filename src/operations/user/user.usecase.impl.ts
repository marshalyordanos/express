import { Injectable, Inject } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { UserDto } from './user.entity';

@Injectable()
export class UserUseCasesImp implements UserUseCasesImp {
  constructor(private readonly userRepo: UserRepository) {}

  async getUser(id: string) {
    return this.userRepo.findUserById(id);
  }

  async getAllUsers() {
    return this.userRepo.findAll();
  }

  async updateUser(id: string, data: Partial<UserDto>) {
    return this.userRepo.updateUser(id, data);
  }

  async deleteUser(id: string) {
    return this.userRepo.deleteUser(id);
  }
}
