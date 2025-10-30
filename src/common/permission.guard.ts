import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY } from './decorator/check-permission.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { PermissionActions } from '../contracts/permission-actions.enum';
import { RpcException } from '@nestjs/microservices';

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
      scopes?: string | string[];
    }>(PERMISSION_KEY, context.getHandler());

    if (!required) return true; // no permission required

    const { resource, action, scopes } = required;

    // Get user from request
    const req = context.switchToHttp().getRequest();
    const userData = req.user;
    const user = await this.prisma.user.findUnique({
      where: { id: userData.sub },
    });

    if (!user) throw new RpcException('User not authenticated');

    // Super admin bypass
    if (user.isSuperAdmin) return true;

    if (!user.roleId) throw new RpcException('User has no role assigned');

    const rolePermissions = await this.prisma.rolePermission.findMany({
      where: { roleId: user.roleId },
      include: { permission: true },
    });
    // console.log(rolePermissions);

    // Dynamically check the action
    const hasPermission = rolePermissions.some(
      (rp) => rp.permission.resource === resource && rp[action],
    );

    // Dynamically check action + optional scope
    // const hasPermission = rolePermissions.some((rp) => {
    //   if (rp.permission.resource !== resource) return false;
    //   if (!rp[action]) return false; // check action

    //   // check scope if defined
    //   if (scope && rp.scope && !rp.scope.includes(scope)) return false;

    //   return true;
    // });

    if (!hasPermission) {
      throw new RpcException(
        `You do not have permission to perform action [${action}] on ${resource}`,
      );
    }
    // ✅ If scopes exist, check them too
    if (scopes) {
      // console.log("Scopes ::: ", scopes);
      // console.log("ROle permissions ::: ", rolePermissions);
      
      const scopeList = Array.isArray(scopes) ? scopes : [scopes];
      const userScopes = rolePermissions
        .filter((rp) => rp.permission.resource === resource && rp[action])
        .flatMap((rp) => rp.scope || []);

      const hasAnyScope = scopeList.some((s) => userScopes.includes(s));
      // console.log("Has any :: ", hasAnyScope);
      
      if (!hasAnyScope) {
        throw new RpcException(
          `You do not have required scope(s): ${scopeList.join(', ')}`,
        );
      }
    }

    return true;
  }
}
