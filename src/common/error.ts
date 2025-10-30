import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { IResponse } from './types';

@Catch()
export class AllExceptions implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctxType = host.getType();
    // console.log(
    //   'ppppppppppppppppp:',

    //   exception,
    //   ctxType,
    //   // exception,
    // );

    let status =
      exception?.statusCode ||
      exception?.error?.statusCode ||
      HttpStatus.INTERNAL_SERVER_ERROR;
    let message = exception?.message || 'Internal server error';

    // Handle Prisma known errors

    // ------------------------
    // HTTP Exceptions
    // ------------------------
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
    }

    // ------------------------
    // RPC Exceptions
    // ------------------------
    else if (exception instanceof RpcException) {
      const rpcError = exception.getError() as any;
      status = rpcError?.statusCode || status;
      message = rpcError?.message || message;
    }

    // if (exception instanceof BadRequestException) {
    //   message = exception?.response?.message || exception.message;
    //   console.log('------------------------------', message);
    // }

    if (exception instanceof BadRequestException) {
      const response = exception.getResponse();
      message =
        typeof response === 'string'
          ? response
          : (response as any)?.message || exception.message;

      // console.log('------------------------------', message);
    }

    // ------------------------
    // HTTP context: send response
    // ------------------------
    if (ctxType === 'http') {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse();

      response.status(status).json(new IResponse(false, message, null, null));
    }

    // ------------------------
    // RPC context: rethrow exception
    // ------------------------
    if (ctxType === 'rpc') {
      throw exception;
    }
  }
}
