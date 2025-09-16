import { Prisma } from '@prisma/client';
import { getPrismaErrorMessage } from './prismaError';
import { RpcException } from '@nestjs/microservices';

export function handleCatch(error: any) {
  let message = 'Internal server error';

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    message = getPrismaErrorMessage(error); // <-- friendly message
    console.log('getPrismaErrorMessage: ', message);
  } else if (error instanceof Error) {
    console.log('getPrismaErrorMessage2: ', error.message);

    message = error.message;
  }

  throw new RpcException({
    statusCode: 400,
    message, // <-- this is now your friendly error
  });
}
