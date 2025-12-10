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
} from '@nestjs/common';

import { ClientProxy } from '@nestjs/microservices';
import { PATTERNS } from '../contracts';
import {
  AcceptDropOffDto,
  AddException,
  AddOrderOnHold,
  ApproveOrderDto,
  CancelOrderDto,
  ConfirmPickUpOrderDto,
  CreateOrderDto,
  MarkUnusualOrderDto,
  RemoveOrderFromOnHold,
  UpdateOrderDto,
  ValidateOrderDto,
} from '../fulfillment/order/order.entity';
import { ListQueryDto } from '../common/query/query.dto';
import * as jwt from 'jsonwebtoken';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CloudinaryUploaderService } from '../common/cloudinary/cloudinary-uploader.service';

@Controller('order')
export class OrderGatewayController {
  constructor(
    @Inject('FULFILLMENT_SERVICE') private readonly orderClient: ClientProxy,
    private readonly cloudinaryUploader: CloudinaryUploaderService,
  ) {}

  //Create order for customer
  @Post()
  async createOrder(@Body() data: CreateOrderDto, @Req() req) {
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
    return this.orderClient.send(PATTERNS.ORDER_CREATE, {
      data,
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
    });
  }

  @Post('/request/approval')
  async requestApproval(@Body() orderIds: string[], @Req() req) {
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
    console.log("SENINFINSDNJG :: ", orderIds);
    
    return this.orderClient.send(PATTERNS.ORDER_REQUEST_APPROVAL, {
      orderIds,
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
    });
  }

  @Post('/user/create')
  async orderCreateValidate(@Body() data: CreateOrderDto, @Req() req) {
    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;
    return this.orderClient.send(PATTERNS.ORDER_CREATE_NOT_LOGGED_IN_CUSTOMER, {
      data,
      ip,
    });
  }

  @Post('/accept')
  async acceptDropOffOrder(@Body() data: AcceptDropOffDto, @Req() req) {
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
    return this.orderClient.send(PATTERNS.ORDER_ACCEPT_DROP_OFF, {
      data,
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
    });
  }

  @Post('/confirm')
  @UseInterceptors(FilesInterceptor('podImages', 5))
  async confirmPickup(
    @UploadedFiles() files: any[],
    @Body() data: ConfirmPickUpOrderDto,
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
          `pod_images/pickup/${data.driverId}/${data.orderId}`,
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

    return this.orderClient.send(PATTERNS.ORDER_CONFIRM_PICKUP, {
      data,
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
    });
  }

  @Patch('/validate/:id')
  async validateOrder(
    @Body() data: ValidateOrderDto,
    @Param('id') id: string,
    @Req() req,
  ) {
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

    return this.orderClient.send(PATTERNS.ORDER_VALIDATE, {
      id,
      data,
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
    });
  }

  @Patch('/unusual/:orderId')
  async unusualOrder(
    @Body() data: MarkUnusualOrderDto,
    @Param('orderId') orderId: string,
    @Req() req,
  ) {
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

    return this.orderClient.send(PATTERNS.ORDER_MARK_UNUSUAL, {
      orderId,
      data,
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
    });
  }

  @Post('/approve')
  async approveOrder(@Body() data: ApproveOrderDto, @Req() req) {
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
    return this.orderClient.send(PATTERNS.ORDER_APPROVE, {
      data,
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
    });
  }

  @Get('/branch/sort-order')
  async getOrdersForSorting(@Req() req) {
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
    return this.orderClient.send(PATTERNS.ORDER_FIND_SORTING, {
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
    });
  }

  @Get('/manifest')
  async getOrderManifest(@Req() req, @Query() query: ListQueryDto) {
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

    return this.orderClient.send(PATTERNS.ORDER_MANIFEST, {
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
      query,
    });
  }

  @Get('/ongoing-delivery')
  async getOngoingAndDeliveredOrders(@Req() req, @Query() query: ListQueryDto) {
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
    return this.orderClient.send(PATTERNS.ORDER_ONGOING_AND_DELIVERED, {
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
      query,
    });
  }

  @Get('/onhold')
  async getOnHoldOrders(@Req() req) {
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
    return this.orderClient.send(PATTERNS.ORDER_FIND_ON_HOLD, {
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
    });
  }

  @Delete('/onhold')
  async removeOnHold(@Body() data: RemoveOrderFromOnHold, @Req() req) {
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
    return this.orderClient.send(PATTERNS.ORDER_FIND_ON_HOLD, {
      data,
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
    });
  }

  @Post('/onhold')
  async addOrderOnHold(@Body() data: AddOrderOnHold, @Req() req) {
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
    return this.orderClient.send(PATTERNS.ORDER_ADD_ON_HOLD, {
      data,
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
    });
  }

  @Patch('/cancel')
  async cancelOrder(@Body() data: CancelOrderDto, @Req() req) {
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
    return this.orderClient.send(PATTERNS.ORDER_CANCEL, {
      data,
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
    });
  }
  ////////////////////////////////////////////////////////////////////////////////
  @Post('/exception')
  async exceptionOrder(@Body() data: AddException, @Req() req) {
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
    return this.orderClient.send(PATTERNS.ORDER_ADD_EXCEPTION, {
      data,
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
    });
  }

  @Get('/exception')
  async getException(@Req() req, @Query() query: ListQueryDto) {
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

    return this.orderClient.send(PATTERNS.ORDER_FIND_EXCEPTIONS, {
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
      query,
    });
  }

  @Patch('/exception/:id')
  async updateException(
    @Body() data: UpdateOrderDto,
    @Param('id') orderId: string,
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
    return this.orderClient.send(PATTERNS.ORDER_REMOVE_EXCEPTION, {
      orderId,
      data,
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
    });
  }

  // ✅ NEW unified GET endpoint with filters
  @Get()
  async getAllOrders(@Req() req, @Query() query: ListQueryDto) {
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

    return this.orderClient.send(PATTERNS.ORDER_FIND_ALL, {
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
      query,
    });
  }

  @Get('/approval/pending')
  async getPendingApprovalOrders(@Req() req, @Query() query: ListQueryDto) {
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
    return this.orderClient.send(PATTERNS.ORDER_FIND_PENDING_APPROVAL, {
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
      query,
    });
  }

  @Get('/status/log')
  async getOrderStatusLog(
    // @Query('orderId') orderId?: string,
    // @Query('staffId') staffId?: string,
    // @Query('search') search?: string,
    // @Query('page') page?: number,
    // @Query('pageSize') pageSize?: number,
    @Req() req,
    @Query() query: ListQueryDto,
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
    return this.orderClient.send(PATTERNS.ORDER_FIND_STATUS_LOG, {
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
      query,
    });
  }

  @Get('/categorical')
  async getCategoricalOrders(@Req() req, @Query() query: ListQueryDto) {
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

    console.log('authHeader: ', authHeader);

    return this.orderClient.send(PATTERNS.ORDER_FIND_CATEGORICAL, {
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
      query,
    });
  }

  @Get('/track/:code')
  async trackOrder(@Param('code') code: string, @Req() req) {
    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const ip = forwarded.split(',')[0] || req.ip || req.socket.remoteAddress;

    return this.orderClient.send(PATTERNS.ORDER_FIND_BY_TRACK_CODE, {
      code,
      ip,
    });
  }

  @Get('/user/track/:code')
  async trackUserOrder(@Param('code') code: string, @Req() req) {
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
    return this.orderClient.send(PATTERNS.ORDER_FIND_BY_USER_AND_TRACK_CODE, {
      code,
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
    });
  }
  @Patch(':id')
  async updateOrder(
    @Param('id') id: string,
    @Body() data: UpdateOrderDto,
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
    return this.orderClient.send(PATTERNS.ORDER_UPDATE, {
      id,
      data,
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
    });
  }

  @Get('/my-orders')
  async getMyOrders(@Req() req, @Query() query: ListQueryDto) {
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
    return this.orderClient.send(PATTERNS.ORDER_FIND_MY_ORDERS, {
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
      query,
    });
  }

  @Get(':id')
  async getOrder(@Param('id') id: string, @Req() req) {
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
    return this.orderClient.send(PATTERNS.ORDER_FIND_BY_ID, {
      id,
      headers: { authorization: authHeader },
      user: decodedUser, // ✅ send user info
      ip,
    });
  }
}
