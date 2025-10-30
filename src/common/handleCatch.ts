import { Prisma } from '@prisma/client';
import { getPrismaErrorMessage } from './prismaError';
import { RpcException } from '@nestjs/microservices';

export function handleCatch(error: any) {
  let message = 'Internal server error';
  let statusCode = 500;

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    message = getPrismaErrorMessage(error); // <-- friendly message
    // console.log('getPrismaErrorMessage: ', message);
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    const msg = error.message;
    if (msg.includes('Argument')) {
      message = msg.split('Argument')[1].trim();
    } else {
      message = msg;
    }
  } else if (error instanceof Error) {
    // console.log('getPrismaErrorMessage2: ', error.message);
    message = error.message;
  }
  // ✅ Preserve existing RpcException status & message
  if (error instanceof RpcException) {
    const err = error.getError() as any;
    statusCode = err?.statusCode || 500;
    message = err?.message || 'Unknown RPC error';
    throw new RpcException({ statusCode, message });
  }
  // throw new RpcException({
  //   statusCode: 400,
  //   message, // <-- this is now your friendly error
  // });

  // Do NOT log stack trace here — only minimal info
  // console.warn(`[ServiceError] ${message}`);

  throw new RpcException({ statusCode, message });
}
