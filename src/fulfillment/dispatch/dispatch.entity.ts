import { IsNotEmpty, IsString } from 'class-validator';

export class AssignDriverForPickup {
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @IsNotEmpty()
  @IsString()
  driverId: string;
}
