import { Prisma } from '@prisma/client';
import { getPrismaErrorMessage } from './prismaError';
import { RpcException } from '@nestjs/microservices';

export function handleCatch(error: any) {
  let message = 'Internal server error';
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    message = getPrismaErrorMessage(error);
  }
  throw new RpcException({ statusCode: 400, message });
}
