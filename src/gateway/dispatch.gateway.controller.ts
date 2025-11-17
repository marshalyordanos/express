import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PATTERNS } from '../contracts';
import {
  AssignDriverForPickup,
  AssignOfficerForBatch,
  BatchDispatchDto,
  BatchHandoverDto,
  CompleteDeliveryDto,
  ConfirmBatchHandoverDto,
  CreateAssignmentRequestsDto,
  CreateDriver,
  GenerateQrDto,
  LastMileDeliveryDto,
  OrderScanTokenDto,
} from '../fulfillment/dispatch/dispatch.entity';
import { ListQueryDto } from '../common/query/query.dto';
import * as jwt from 'jsonwebtoken';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CloudinaryUploaderService } from '../common/cloudinary/cloudinary-uploader.service';
import { lastValueFrom } from 'rxjs';
import { log } from 'console';

@Controller('dispatch')
export class DispatchGatewayController {
  constructor(
    @Inject('FULFILLMENT_SERVICE') private readonly dispatchClient: ClientProxy,
    private readonly cloudinaryUploader: CloudinaryUploaderService,
  ) {}

  @Post()
  async createDispatch() {}

  // Controller used for assigning driver for the pick up of the package from the customer
  @Post('/assign-pickup')
  async assignDispatch(
    @Body() data: AssignDriverForPickup,
    @Req() req,
  ): Promise<any> {
    console.log('data: ', data);
    const authHeader = req.headers['authorization'] || null;
    let token = req.headers['authorization']?.replace('Bearer ', '') || null;

    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
    let decodedUser = null;
    try {
      decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
      // decodedUser = this.jwtService.verify(token);
    } catch (err) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return this.dispatchClient.send(
      PATTERNS.DISPATCH_ASSIGN_DRIVER_FOR_PICKUP,
      {
        data,
        headers: { authorization: authHeader },
        user: decodedUser, // ✅ send user info
        ip,
      },
    );
  }

  //Controller used for assigning a cargo officer for batched orders to give them for airport
  @Post('/batch/assign-officer')
  async assignOfficerToBatch(
    @Body() data: AssignOfficerForBatch,
    @Req() req,
  ): Promise<any> {
    const authHeader = req.headers['authorization'] || null;
    let token = req.headers['authorization']?.replace('Bearer ', '') || null;

    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
    let decodedUser = null;
    try {
      decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
      // decodedUser = this.jwtService.verify(token);
    } catch (err) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return this.dispatchClient.send(PATTERNS.DISPATCH_ASSIGN_OFFICER_TO_BATCH, {
      data,
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
    });
  }

  //COntroller used for accepting dispatch from the operation manager and it is done by cargo officer
  @Post('/accept-batch')
  async acceptDispatch(
    @Body() data: AssignOfficerForBatch,
    @Req() req,
  ): Promise<any> {
    const authHeader = req.headers['authorization'] || null;
    let token = req.headers['authorization']?.replace('Bearer ', '') || null;

    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
    let decodedUser = null;
    try {
      decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
      // decodedUser = this.jwtService.verify(token);
    } catch (err) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return this.dispatchClient.send(
      PATTERNS.DISPATCH_COLLECT_BATCH_BY_CARGO_OFFICER,
      {
        data,
        headers: { authorization: authHeader },
        user: decodedUser, // ✅ send user info
        ip,
      },
    );
  }

  //COntroller used for delivering dispatch to the airport and it is done by cargo officer
  @Post('/handover')
  async handoverBatchesToAirport(
    @Body() data: BatchHandoverDto,
    @Req() req,
  ): Promise<any> {
    const authHeader = req.headers['authorization'] || null;
    let token = req.headers['authorization']?.replace('Bearer ', '') || null;

    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
    let decodedUser = null;
    try {
      decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
      // decodedUser = this.jwtService.verify(token);
    } catch (err) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return this.dispatchClient.send(
      PATTERNS.DISPATCH_HAND_OVER_BATCHES_TO_AIRPORT,
      {
        data,
        headers: { authorization: authHeader },
        user: decodedUser, // ✅ send user info
        ip,
      },
    );
  }

  //Controller used for collecting or recieving dispatch from the airport and it is done by local branch customer officer
  @Post('/collect')
  async collectFromAirport(
    @Body() data: OrderScanTokenDto,
    @Req() req,
  ): Promise<any> {
    const authHeader = req.headers['authorization'] || null;
    let token = req.headers['authorization']?.replace('Bearer ', '') || null;

    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
    let decodedUser = null;
    try {
      decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
      // decodedUser = this.jwtService.verify(token);
    } catch (err) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return this.dispatchClient.send(PATTERNS.DISPATCH_COLLECT_FROM_AIRPORT, {
      data,
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
    });
  }

  @Patch('/compare/:officerId')
  async compareOrders(
    @Param('officerId') officerId: string,
    @Req() req,
  ): Promise<any> {
    const authHeader = req.headers['authorization'] || null;
    let token = req.headers['authorization']?.replace('Bearer ', '') || null;

    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
    let decodedUser = null;
    try {
      decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
      // decodedUser = this.jwtService.verify(token);
    } catch (err) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return this.dispatchClient.send(PATTERNS.DISPATCH_COMPARE_SCANNED_ORDERS, {
      officerId,
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
    });
  }

  @Post('/confirm-arrival-and-handover')
  async confirmArrivalAndHandover(
    @Body() data: ConfirmBatchHandoverDto,
    @Req() req,
  ): Promise<any> {
    const authHeader = req.headers['authorization'] || null;
    let token = req.headers['authorization']?.replace('Bearer ', '') || null;

    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
    let decodedUser = null;
    try {
      decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
      // decodedUser = this.jwtService.verify(token);
    } catch (err) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return this.dispatchClient.send(
      PATTERNS.DISPATCH_CONFIRM_ARRIVAL_AND_HANDOVER,
      {
        data,
        headers: { authorization: authHeader },
        user: decodedUser, // ✅ send user info
        ip,
      },
    );
  }

  //COntroller used for creating or categorizing batch orders or used for creating batch dispatch after categorization
  @Post('/batch')
  async createBatchDispatch(
    @Body() data: BatchDispatchDto,
    @Req() req,
  ): Promise<any> {
    const authHeader = req.headers['authorization'] || null;
    let token = req.headers['authorization']?.replace('Bearer ', '') || null;

    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
    let decodedUser = null;
    try {
      decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
      // decodedUser = this.jwtService.verify(token);
    } catch (err) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    console.log('data: ', data);
    return this.dispatchClient.send(PATTERNS.DISPATCH_APPROVE_CATEGORIZATION, {
      data,
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
    });
  }

  @Post('/driver/requests')
  async createDriverAssignmentRequests(
    @Body() data: CreateAssignmentRequestsDto,
    @Req() req,
  ): Promise<any> {
    const authHeader = req.headers['authorization'] || null;
    let token = req.headers['authorization']?.replace('Bearer ', '') || null;

    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
    let decodedUser = null;
    try {
      decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
      // decodedUser = this.jwtService.verify(token);
    } catch (err) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return this.dispatchClient.send(
      PATTERNS.DISPATCH_CREATE_ASSIGNEMENT_REQUEST,
      {
        data,
        headers: { authorization: authHeader },
        user: decodedUser, // ✅ send user info
        ip,
      },
    );
  }

  @Patch('/driver/accept/:orderId')
  async driverAccept(
    @Param('orderId') orderId: string,
    @Req() req,
  ): Promise<any> {
    const authHeader = req.headers['authorization'] || null;
    let token = req.headers['authorization']?.replace('Bearer ', '') || null;

    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
    let decodedUser = null;
    try {
      decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
      // decodedUser = this.jwtService.verify(token);
    } catch (err) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return this.dispatchClient.send(
      PATTERNS.DISPATCH_ACCEPT_ASSIGNEMENT_REQUEST,
      {
        orderId,
        headers: { authorization: authHeader },
        user: decodedUser, // ✅ send user info
        ip,
      },
    );
  }

  //Controller used for assigning driver for the last mile delivery of the package
  @Post('/assign-delivery')
  async assignDriverForDelivery(
    @Body() data: AssignDriverForPickup,
    @Req() req,
  ): Promise<any> {
    const authHeader = req.headers['authorization'] || null;
    let token = req.headers['authorization']?.replace('Bearer ', '') || null;

    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
    let decodedUser = null;
    try {
      decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
      // decodedUser = this.jwtService.verify(token);
    } catch (err) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return this.dispatchClient.send(
      PATTERNS.DISPATCH_ASSIGN_DRIVER_FOR_DELIVERY,
      {
        data,
        headers: { authorization: authHeader },
        user: decodedUser, // ✅ send user info
        ip,
      },
    );
  }

  @Post('/last-mile-delivery')
  async lastMileDelivery(
    @Body() data: LastMileDeliveryDto,
    @Req() req,
  ): Promise<any> {
    const authHeader = req.headers['authorization'] || null;
    let token = req.headers['authorization']?.replace('Bearer ', '') || null;

    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
    let decodedUser = null;
    try {
      decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
      // decodedUser = this.jwtService.verify(token);
    } catch (err) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return this.dispatchClient.send(
      PATTERNS.DISPATCH_ACCEPT_LAST_MILE_DELIVERY,
      {
        data,
        headers: { authorization: authHeader },
        user: decodedUser, // ✅ send user info
        ip,
      },
    );
  }

  @Post('/complete-delivery')
  @UseInterceptors(FilesInterceptor('podImages', 5))
  async completeDelivery(
    // @UploadedFiles() files: Express.Multer.File[],
    @UploadedFiles() files: any[],

    @Body() data: CompleteDeliveryDto,
    @Req() req,
  ) {
    let uploadedImages = [];

    // ✅ Upload only if files exist and are valid
    if (files && files.length > 0) {
      console.log('Uploading proof of delivery images...');
      try {
        const fileStreamsOrBuffers = files.map(
          (file) => file.stream || file.buffer,
        );
        uploadedImages = await this.cloudinaryUploader.uploadFiles(
          fileStreamsOrBuffers,
          `pod_images/${data.driverId}/${data.orderId}`,
        );

        data.podImages = uploadedImages;
        console.log('Proof of delivery images uploaded successfully.');
      } catch (error) {
        console.error('Cloudinary upload failed:', error);
        throw new HttpException(
          'Failed to upload proof of delivery images',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    } else {
      console.log('No files provided — skipping upload.');
      data.podImages = []; // keep consistent structure
    }

    // ✅ Decode JWT
    const authHeader = req.headers['authorization'] || null;
    let decodedUser = null;
    try {
      const token = authHeader?.replace('Bearer ', '');
      decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
    } catch {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }

    console.log('Sending to microservice');

    // ✅ Get IP address
    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
    console.log('Ip address :::', ip);

    // ✅ Call microservice

    return this.dispatchClient.send(PATTERNS.DISPATCH_COMPLETE_DELIVERY, {
      data,
      headers: { authorization: authHeader },
      user: decodedUser,
      ip,
    });
  }

  //COntroller used for changing driver for the package from or to the customer
  @Patch('change-driver')
  async changeDriverForOrder(
    @Body() data: AssignDriverForPickup,
    @Req() req,
  ): Promise<any> {
    const authHeader = req.headers['authorization'] || null;
    let token = req.headers['authorization']?.replace('Bearer ', '') || null;

    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
    let decodedUser = null;
    try {
      decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
      // decodedUser = this.jwtService.verify(token);
    } catch (err) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return this.dispatchClient.send(PATTERNS.DISPATCH_CHANGE_DRIVER_FOR_ORDER, {
      data,
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
    });
  }

  //COntroller used  for removing driver completely from the order
  @Delete('remove-driver/:orderId')
  async removeDriverFromOrder(
    @Param('orderId') orderId: string,
    @Req() req,
  ): Promise<any> {
    const authHeader = req.headers['authorization'] || null;
    let token = req.headers['authorization']?.replace('Bearer ', '') || null;

    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
    let decodedUser = null;
    try {
      decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
      // decodedUser = this.jwtService.verify(token);
    } catch (err) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return this.dispatchClient.send(
      PATTERNS.DISPATCH_REMOVE_DRIVER_FROM_ORDER,
      {
        orderId,
        headers: { authorization: authHeader },
        user: decodedUser, // ✅ send user info
        ip,
      },
    );
  }

  //Controller used for getting all batch dispatches with filters and pagination
  @Get()
  async getAllDispatches(@Req() req, @Query() query: ListQueryDto) {
    const authHeader = req.headers['authorization'] || null;
    let token = req.headers['authorization']?.replace('Bearer ', '') || null;

    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
    let decodedUser = null;
    try {
      decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
      // decodedUser = this.jwtService.verify(token);
    } catch (err) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }

    return this.dispatchClient.send(PATTERNS.DISPATCH_FIND_ALL, {
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
      query,
    });
  }

  @Get('/officer')
  async getDispatchesForOfficer(@Req() req, @Query() query: ListQueryDto) {
    const authHeader = req.headers['authorization'] || null;
    let token = req.headers['authorization']?.replace('Bearer ', '') || null;

    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
    let decodedUser = null;
    try {
      decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
      // decodedUser = this.jwtService.verify(token);
    } catch (err) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }

    return this.dispatchClient.send(
      PATTERNS.DISPATCH_FIND_DELIVERED_AND_ONGOING,
      {
        headers: { authorization: authHeader },
        user: decodedUser, // ✅ send user info
        ip,
        query,
      },
    );
  }

  //Need Sanitization
  //Controller used for adding new orders to the batches. this happened when new orders came and it can be categoriezed with existing batch dispatch or may be new order's service type is sameday and used to send it with in existing dispatched orders
  @Patch('/add-order/:batchId')
  async addOrderToBatch(
    @Param('batchId') batchId: string,
    @Body() data: any,
    @Req() req,
  ) {
    const authHeader = req.headers['authorization'] || null;
    let token = req.headers['authorization']?.replace('Bearer ', '') || null;

    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
    let decodedUser = null;
    try {
      decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
      // decodedUser = this.jwtService.verify(token);
    } catch (err) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return this.dispatchClient.send(PATTERNS.DISPATCH_ADD_ORDERS_TO_BATCH, {
      batchId,
      newOrderIds: data.orders,
      // updateData: body.updateData
      data,
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
    });
  }

  @Post('/qr-generate')
  async generateQrCode(@Body() data: GenerateQrDto, @Req() req) {
    const authHeader = req.headers['authorization'] || null;
    let token = req.headers['authorization']?.replace('Bearer ', '') || null;

    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
    let decodedUser = null;
    try {
      decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
      // decodedUser = this.jwtService.verify(token);
    } catch (err) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return this.dispatchClient.send(PATTERNS.DISPATCH_GENERATE_QR_CODE, {
      data,
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
    });
  }

  @Post('/driver')
  async createDriver(@Body() data: CreateDriver, @Req() req) {
    const authHeader = req.headers['authorization'] || null;
    let token = req.headers['authorization']?.replace('Bearer ', '') || null;

    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
    let decodedUser = null;
    try {
      decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
      // decodedUser = this.jwtService.verify(token);
    } catch (err) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    console.log('Create driver datas : ', data);

    return this.dispatchClient.send(PATTERNS.DISPATCH_CREATE_DRIVER, {
      data,
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
    });
  }

  @Get('/driver')
  async findDriver(@Query() query: ListQueryDto, @Req() req) {
    const authHeader = req.headers['authorization'] || null;
    let token = req.headers['authorization']?.replace('Bearer ', '') || null;

    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
    let decodedUser = null;
    try {
      decodedUser = jwt.verify(token, process.env.JWT_SECRET || 'yourSecret');
      // decodedUser = this.jwtService.verify(token);
    } catch (err) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    console.log('FInd driver querys: ', query);

    return this.dispatchClient.send(PATTERNS.DISPATCH_FIND_DRIVER, {
      query,
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
    });
  }

  @Get(':id')
  async getDispatchById() {}

  @Get('/order/:id')
  async getDispatchByOrderId() {}

  @Get('/branch/:id')
  async getDispatchByBranchId() {}

  @Get('/staff/:id')
  async getDispatchByStaffId() {}

  @Get('/customer/:id')
  async getDispatchByCustomerId() {}

  @Get('/driver/:id')
  async getDispatchByDriverId() {}

  @Get('/vehicle/:id')
  async getDispatchByVehicleId() {}
}
