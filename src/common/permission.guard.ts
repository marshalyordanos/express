import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY } from './decorator/check-permission.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { PermissionActions } from 'src/contracts/permission-actions.enum';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.get<{
      resource: string;
      action: PermissionActions;
    }>(PERMISSION_KEY, context.getHandler());

    if (!required) return true; // no permission required

    const { resource, action } = required;

    const req = context.switchToHttp().getRequest();
    const user = req.user;

    if (!user) throw new UnauthorizedException('User not authenticated');

    if (user.isSuperAdmin) return true; // bypass for super admin

    if (!user.roleId) throw new ForbiddenException('User has no role assigned');

    const rolePermissions = await this.prisma.rolePermission.findMany({
      where: { roleId: user.roleId },
      include: { permission: true },
    });

    // Check action on RolePermission
    const hasPermission = rolePermissions.some(
      (rp) => rp.permission.resource === resource && rp[`${action}Action`],
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `You do not have permission to perform action [${action}] on ${resource}`,
      );
    }

    return true;
  }
}
