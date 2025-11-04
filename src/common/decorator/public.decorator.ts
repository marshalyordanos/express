import { SetMetadata } from '@nestjs/common';

export const Public = () => SetMetadata('isPublic', true);

export const WS_PUBLIC_KEY = 'isPublicWs';
export const WsPublic = () => SetMetadata(WS_PUBLIC_KEY, true);