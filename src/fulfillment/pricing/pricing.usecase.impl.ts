import { FeeType, ServiceType, ShippingScope } from '@prisma/client';
import { PricingRepository } from './pricing.repository';
import { PricingUseCases } from './pricing.usecase';
import {
  AirportFeeDto,
  CustomerCategoryDto,
  DiscountDto,
  MiscellaneousFeeDto,
  ProfitMarginDto,
  SurchargeDto,
  TariffDto,
  UpdateAirportFeeDto,
  UpdateCustomerCategoryDto,
  UpdateDiscountDto,
  UpdateMiscellaneousFeeDto,
  UpdateProfitMarginDto,
  UpdateSurchargeDto,
  UpdateTariffDto,
} from './pricing.entity';
import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class PricingUseCasesImpl implements PricingUseCases {
  constructor(private readonly pricingRepo: PricingRepository) {}
  //===============================================================================================TARIFF===========================================================================================================
  /**
   * Create tariff with full validation.
   * - Business checks live here (no throws in repo).
   */
  async createTariff(data: TariffDto) {
    console.log("Tariff data  service : ", data);
    
    if (data.customerCategoryId) {
      const category = await this.pricingRepo.findCustomerCategoryById(
        data.customerCategoryId,
      );
      if (!category) {
        throw new RpcException(
          `Customer Category with id ${data.customerCategoryId} not found.`,
        );
      }
    }
    // 1. basic presence checks (DTO + validation pipe should cover most)
    if (!data.serviceType) {
      throw new RpcException('serviceType is required');
    }

    if (data.baseFee == null || Number.isNaN(Number(data.baseFee))) {
      throw new RpcException('baseFee must be a valid number');
    }

    // 2. numeric validations
    if (Number(data.baseFee) < 0) {
      throw new RpcException('baseFee must be >= 0');
    }
    if (data.perKgRate != null && Number(data.perKgRate) < 0) {
      throw new RpcException('perKgRate must be >= 0');
    }
    if (data.perKmRate != null && Number(data.perKmRate) < 0) {
      throw new RpcException('perKmRate must be >= 0');
    }

    // 3. currency validation (basic)
    if (!data.currency || typeof data.currency !== 'string') {
      throw new RpcException('currency is required');
    }
    const currency = data.currency.trim().toUpperCase();
    if (currency.length < 2 || currency.length > 5) {
      throw new RpcException('currency must be 2-5 characters (e.g. ETB, USD)');
    }

    // 4. date parsing & validation
    const effectiveFrom = new Date(data.effectiveFrom);
    if (isNaN(effectiveFrom.getTime())) {
      throw new RpcException('effectiveFrom is not a valid ISO date');
    }

    let effectiveTo: Date | null = null;
    if (data.effectiveTo) {
      effectiveTo = new Date(data.effectiveTo);
      if (isNaN(effectiveTo.getTime())) {
        throw new RpcException('effectiveTo is not a valid ISO date');
      }
      if (effectiveFrom > effectiveTo) {
        throw new RpcException(
          'effectiveFrom must be on or before effectiveTo',
        );
      }
    }

    // 5. business rule: avoid overlapping tariffs for same serviceType
    const overlap = await this.pricingRepo.findOverlappingTariff(
      data.serviceType as ServiceType,
      effectiveFrom,
      effectiveTo,
      data.shippingScope as ShippingScope,
    );
    if (overlap) {
      throw new RpcException(
        `Overlapping tariff exists for this service type (id=${overlap.id}, name="${overlap.name}")`,
      );
    }

    // 6. optional: avoid duplicate name + serviceType + shippingScope
    const dup = await this.pricingRepo.findByNameAndServiceType(
      data.name.trim(),
      data.serviceType,
      data.shippingScope,
    );
    if (dup) {
      throw new RpcException(
        'A tariff with the same name and service type already exists',
      );
    }

    // 7. Ensure at least one pricing driver exists (baseFee, perKmRate, or perKgRate)
    if (
      (data.baseFee === 0 || data.baseFee == null) &&
      (data.perKmRate == null || Number(data.perKmRate) === 0) &&
      (data.perKgRate == null || Number(data.perKgRate) === 0)
    ) {
      throw new RpcException(
        'Tariff must define at least one of baseFee, perKmRate or perKgRate with a positive value',
      );
    }

    // 8. Prepare payload for repository (normalize types)
    const payload: any = {
      name: data.name.trim(),
      serviceType: data.serviceType,
      shippingScope: data.shippingScope,
      customerCategoryId: data.customerCategoryId,
      baseFee: Number(data.baseFee),
      perKmRate: data.perKmRate != null ? Number(data.perKmRate) : null,
      perKgRate: data.perKgRate != null ? Number(data.perKgRate) : null,
      currency,
      effectiveFrom,
      effectiveTo: effectiveTo ?? null,
      isActive: true,
    };
    console.log('Tariff payload : ', payload);

    // 9. call repo (DB-only interaction)
    const created = await this.pricingRepo.createTariff(payload);
    console.log('Tariff created : ', created);

    return created;
  }

  async findAllTariff(): Promise<any> {
    return await this.pricingRepo.findAllTariff();
  }
  async findTariffById(id: string): Promise<any> {
    if (!id) throw new RpcException('Tariff ID is required');

    const tariff = await this.pricingRepo.findTariffById(id);
    if (!tariff) throw new RpcException('Tariff not found');

    return tariff;
  }
  async updateTariff(id: string, data: Partial<UpdateTariffDto>): Promise<any> {
    if (!id) throw new RpcException('Tariff ID is required');

    // Validate numeric fields
    if (data.baseFee !== undefined && data.baseFee < 0)
      throw new RpcException('baseFee must be >= 0');
    if (data.perKgRate !== undefined && data.perKgRate < 0)
      throw new RpcException('perKgRate must be >= 0');
    if (data.perKmRate !== undefined && data.perKmRate < 0)
      throw new RpcException('perKmRate must be >= 0');

    // Validate dates
    if (data.effectiveFrom && data.effectiveTo) {
      if (new Date(data.effectiveFrom) >= new Date(data.effectiveTo))
        throw new RpcException('effectiveFrom must be before effectiveTo');
    }

    // Validate serviceType
    if (
      data.serviceType &&
      !Object.values(ServiceType).includes(data.serviceType)
    )
      throw new RpcException('Invalid serviceType');

    return await this.pricingRepo.updateTariff(id, data);
  }
  async deleteTariff(id: string): Promise<any> {
    if (!id) throw new RpcException('Tariff ID is required');

    const tariff = await this.pricingRepo.findTariffById(id);
    if (!tariff) throw new RpcException('Tariff not found');

    return await this.pricingRepo.deleteTariff(id);
  }
  //===========================================================================================================================PROFIT MARGIN==============================================================================================================================
  async createProfitMargin(data: ProfitMarginDto) {
    // 1️⃣ Check tariff exists
    const tariff = await this.pricingRepo.findTariffById(data.tariffId);
    if (!tariff) throw new RpcException('Tariff not found');

    // 2️⃣ Validate min/max logic
    if (data.minAmount && data.maxAmount && data.minAmount > data.maxAmount) {
      throw new RpcException('minAmount cannot be greater than maxAmount');
    }

    // 3️⃣ Validate percentage
    if (data.percentage < 0 || data.percentage > 100) {
      throw new RpcException('percentage must be between 0 and 100');
    }

    // 4️⃣ Ensure no existing profit margin for this tariff
    const exists = await this.pricingRepo.findByTariffId(data.tariffId);
    if (exists)
      throw new RpcException('Profit margin already exists for this tariff');

    // ✅ Create
    return this.pricingRepo.createProfitMargin(data);
  }

  async findAllProfitMargins() {
    return this.pricingRepo.findAll();
  }

  async findProfitMarginById(id: string) {
    const pm = await this.pricingRepo.findProfitMarginById(id);
    if (!pm) throw new RpcException('Profit margin not found');
    return pm;
  }

  async updateProfitMargin(id: string, data: UpdateProfitMarginDto) {
    const pm = await this.pricingRepo.findProfitMarginById(id);
    if (!pm) throw new RpcException('Profit margin not found');

    // Validate min/max if both present
    if (data.minAmount && data.maxAmount && data.minAmount > data.maxAmount) {
      throw new RpcException('minAmount cannot be greater than maxAmount');
    }

    if (data.percentage && (data.percentage < 0 || data.percentage > 100)) {
      throw new RpcException('percentage must be between 0 and 100');
    }
    return this.pricingRepo.updateProfitMargin(id, data);
  }

  async deleteProfitMargin(id: string) {
    const pm = await this.pricingRepo.findProfitMarginById(id);
    if (!pm) throw new RpcException('Profit margin not found');

    return this.pricingRepo.deleteProfitMargin(id);
  }
  //==================================================================================================================AIRPORT FEES==============================================================================================================================
  async createAirportFee(data: AirportFeeDto) {
    // 1. Check Tariff exists
    console.log('data.tariffId: ', data.tariffId);
    
    const tariff = await this.pricingRepo.findTariffById(data.tariffId);
    if (!tariff)
      throw new RpcException(`Tariff with id ${data.tariffId} does not exist`);

    // 2. Validate fee type
    if (!data.perKgRate && !data.flatFee) {
      throw new RpcException('Either perKgRate or flatFee must be provided');
    }

    // 3. Validate dates
    const from = new Date(data.effectiveFrom);
    const to = data.effectiveTo ? new Date(data.effectiveTo) : null;
    if (to && from >= to) {
      throw new RpcException('effectiveFrom must be earlier than effectiveTo');
    }

    // 4. Check for duplicate/overlap (same tariff + airport + serviceType)
    const overlap = await this.pricingRepo.findOverlappingAirportFee(
      data,
      from,
      to,
    );
    if (overlap) {
      throw new RpcException(
        `Overlapping airport fee already exists for ${data.airportCode} (${data.serviceType}) in this tariff`,
      );
    }
    // 5. If all good → save
    return this.pricingRepo.createAirportFee(data);
  }

  async findAllAirportFees() {
    return this.pricingRepo.findAllAirportFees();
  }

  async findAirportFeeById(id: string) {
    const fee = await this.pricingRepo.findAirportFeeById(id);
    if (!fee) throw new RpcException(`AirportFee with id ${id} not found`);
    return fee;
  }

  async updateAirportFee(id: string, data: Partial<UpdateAirportFeeDto>) {
    // Validate dates
    if (data.effectiveFrom && data.effectiveTo) {
      const from = new Date(data.effectiveFrom);
      const to = new Date(data.effectiveTo);
      if (from >= to) {
        throw new RpcException(
          'effectiveFrom must be earlier than effectiveTo',
        );
      }
    }
    return this.pricingRepo.updateAirportFee(id, data);
  }

  async deleteAirportFee(id: string) {
    return this.pricingRepo.deleteAirportFee(id);
  }
  //==================================================================================================================MISCELLANEOUS FEES==============================================================================================================================

  async createMiscFee(data: MiscellaneousFeeDto) {
    // 1. Check tariff exists
    const tariff = await this.pricingRepo.findTariffById(data.tariffId);
    if (!tariff)
      throw new RpcException(`Tariff with id ${data.tariffId} does not exist`);

    // 2. Amount validations
    if (data.amount <= 0)
      throw new RpcException('Amount must be greater than 0');
    if (
      data.feeType === FeeType.PERCENTAGE &&
      (data.amount <= 0 || data.amount > 100)
    ) {
      throw new RpcException('Percentage fee must be between 0 and 100');
    }

    // 3. Date validations
    const from = new Date(data.effectiveFrom);
    const to = data.effectiveTo ? new Date(data.effectiveTo) : null;
    if (to && from >= to)
      throw new RpcException('effectiveFrom must be earlier than effectiveTo');
    // // 4. Prevent duplicate overlapping fees for same name + tariff
    // const overlap = await this.pricingRepo.findOverlappingMiscellaneousFee(data, from, to);
    // if (overlap) {
    //   throw new RpcException(`Overlapping misc fee with name "${data.name}" already exists for this tariff`);
    // }

    // 5. Save
    return this.pricingRepo.createMiscFee(data);
  }

  // ✅ Get all
  async findAllMiscFees() {
    return this.pricingRepo.findAllMiscFees();
  }

  // ✅ Get by ID
  async findMiscFeeById(id: string) {
    const fee = await this.pricingRepo.findMiscFeeById(id);
    if (!fee) throw new RpcException(`MiscFee with id ${id} not found`);
    return fee;
  }
  // ✅ Update with validations
  async updateMiscFee(id: string, data: Partial<UpdateMiscellaneousFeeDto>) {
    // Validate amount if provided
    if (data.amount !== undefined) {
      if (data.amount <= 0)
        throw new RpcException('Amount must be greater than 0');
      if (
        data.feeType === FeeType.PERCENTAGE &&
        (data.amount <= 0 || data.amount > 100)
      ) {
        throw new RpcException('Percentage fee must be between 0 and 100');
      }
    }
    // Validate dates if provided
    if (data.effectiveFrom && data.effectiveTo) {
      const from = new Date(data.effectiveFrom);
      const to = new Date(data.effectiveTo);
      if (from >= to)
        throw new RpcException(
          'effectiveFrom must be earlier than effectiveTo',
        );
    }
    return this.pricingRepo.updateMiscFee(id, data);
  }

  // ✅ Delete
  async deleteMiscFee(id: string) {
    return this.pricingRepo.deleteMiscFee(id);
  }
  //===========================================================================================================================SURCHARGE==============================================================================================================================

  // ── CREATE ──
  async createSurcharge(data: SurchargeDto) {
    // 1️⃣ Validate tariff existence
    const tariff = await this.pricingRepo.findTariffById(data.tariffId);
    if (!tariff) {
      throw new RpcException({
        code: 404,
        message: `Tariff with id ${data.tariffId} not found`,
      });
    }
    // 2️⃣ Validate type
    if (!['percentage', 'fixed'].includes(data.type.toLowerCase())) {
      throw new RpcException({
        code: 400,
        message: `Invalid type "${data.type}". Allowed: "percentage" or "fixed"`,
      });
    }
    // 3️⃣ Validate value
    if (data.value < 0) {
      throw new RpcException({
        code: 400,
        message: `Surcharge value cannot be negative`,
      });
    }
    // 4️⃣ Optional: validate serviceType if provided
    if (
      data.serviceType &&
      !Object.values(ServiceType).includes(data.serviceType)
    ) {
      throw new RpcException({
        code: 400,
        message: `Invalid serviceType "${data.serviceType}"`,
      });
    }
    // 5️⃣ Optional: validate shippingScope if provided
    if (
      data.shippingScope &&
      !Object.values(ShippingScope).includes(data.shippingScope)
    ) {
      throw new RpcException({
        code: 400,
        message: `Invalid shippingScope "${data.shippingScope}"`,
      });
    }
    // ✅ Create surcharge
    return await this.pricingRepo.createSurcharge(data);
  }

  // ── UPDATE ──
  async updateSurcharge(id: string, data: Partial<UpdateSurchargeDto>) {
    const existing = await this.pricingRepo.findSurchargeById(id);
    if (!existing) {
      throw new RpcException({
        code: 404,
        message: `Surcharge with id ${id} not found`,
      });
    }

    // 1️⃣ Validate type if updated
    if (
      data.type &&
      !['percentage', 'fixed'].includes(data.type.toLowerCase())
    ) {
      throw new RpcException({
        code: 400,
        message: `Invalid type "${data.type}". Allowed: "percentage" or "fixed"`,
      });
    }

    // 2️⃣ Validate value if updated
    if (data.value !== undefined && data.value < 0) {
      throw new RpcException({
        code: 400,
        message: `Surcharge value cannot be negative`,
      });
    }

    // 3️⃣ Optional: validate serviceType if provided
    if (
      data.serviceType &&
      !Object.values(ServiceType).includes(data.serviceType)
    ) {
      throw new RpcException({
        code: 400,
        message: `Invalid serviceType "${data.serviceType}"`,
      });
    }

    // 4️⃣ Optional: validate shippingScope if provided
    if (
      data.shippingScope &&
      !Object.values(ShippingScope).includes(data.shippingScope)
    ) {
      throw new RpcException({
        code: 400,
        message: `Invalid shippingScope "${data.shippingScope}"`,
      });
    }
    return await this.pricingRepo.updateSurcharge(id, data);
  }

  // ── GET ALL ──
  async findAllSurcharge() {
    return await this.pricingRepo.findAllSurcharge();
  }

  // ── GET BY ID ──
  async findSurchargeById(id: string) {
    const surcharge = await this.pricingRepo.findSurchargeById(id);
    if (!surcharge)
      throw new RpcException({
        code: 404,
        message: `Surcharge with id ${id} not found`,
      });
    return surcharge;
  }

  // ── DELETE ──
  async deleteSurcharge(id: string) {
    const existing = await this.pricingRepo.findSurchargeById(id);
    if (!existing)
      throw new RpcException({
        code: 404,
        message: `Surcharge with id ${id} not found`,
      });
    return await this.pricingRepo.deleteSurcharge(id);
  }
  //============================================================================================================================================DISCOUNT================================================================================================================================

  // ── CREATE ──
  async createDiscount(data: DiscountDto) {
    // 1️⃣ Validate tariff
    const tariff = await this.pricingRepo.findTariffById(data.tariffId);
    if (!tariff)
      throw new RpcException({
        code: 404,
        message: `Tariff with id ${data.tariffId} not found`,
      });

    // 2️⃣ Validate type
    if (!['percentage', 'fixed'].includes(data.type.toLowerCase()))
      throw new RpcException({
        code: 400,
        message: `Invalid type "${data.type}". Allowed: percentage or fixed`,
      });

    // 3️⃣ Validate value
    if (data.value < 0)
      throw new RpcException({
        code: 400,
        message: `Discount value cannot be negative`,
      });

    // 4️⃣ Validate customer category (optional)
    if (data.customerCategoryId) {
      const category = await this.pricingRepo.findCustomerCategoryById(
        data.customerCategoryId,
      );
      if (!category)
        throw new RpcException({
          code: 404,
          message: `Customer category not found`,
        });
    }

    // 5️⃣ Validate dates
    const validFrom = new Date(data.validFrom);
    const validTo = data.validTo ? new Date(data.validTo) : null;
    if (validTo && validFrom > validTo)
      throw new RpcException({
        code: 400,
        message: `validFrom cannot be after validTo`,
      });

    return await this.pricingRepo.createDiscount({
      ...data,
      validFrom,
      validTo,
    });
  }

  // ── UPDATE ──
  async updateDiscount(id: string, data: Partial<UpdateDiscountDto>) {
    const existing = await this.pricingRepo.findDiscountById(id);
    if (!existing)
      throw new RpcException({
        code: 404,
        message: `Discount with id ${id} not found`,
      });

    if (data.type && !['percentage', 'fixed'].includes(data.type.toLowerCase()))
      throw new RpcException({
        code: 400,
        message: `Invalid type "${data.type}"`,
      });

    if (data.value !== undefined && data.value < 0)
      throw new RpcException({
        code: 400,
        message: `Discount value cannot be negative`,
      });

    if (data.customerCategoryId) {
      const category = await this.pricingRepo.findCustomerCategoryById(
        data.customerCategoryId,
      );
      if (!category)
        throw new RpcException({
          code: 404,
          message: `Customer category not found`,
        });
    }
    // 4. date parsing & validation
    const validFrom = new Date(data.validTo);
    if (isNaN(validFrom.getTime())) {
      throw new RpcException('Valid From is not a valid ISO date.');
    }

    let validTo: Date | null = null;
    if (data.validFrom) {
      validTo = new Date(data.validTo);
      if (isNaN(validTo.getTime())) {
        throw new RpcException('Valid To is not a valid ISO date.');
      }
      if (validFrom > validTo) {
        throw new RpcException('Valid From must be on or before Valid To.');
      }
    }

    // const validFrom = data.validFrom ? new Date(data.validFrom) : undefined;
    // const validTo = data.validTo ? new Date(data.validTo) : undefined;
    // if (validFrom && validTo && validFrom > validTo)
    //   throw new RpcException({ code: 400, message: `validFrom cannot be after validTo` });

    return await this.pricingRepo.updateDiscount(
      id,
      { ...data },
      validFrom,
      validTo,
    );
  }

  // ── GET ALL ──
  async findAllDiscount() {
    return await this.pricingRepo.findAllDiscount();
  }

  // ── GET BY ID ──
  async findDiscountById(id: string) {
    const discount = await this.pricingRepo.findDiscountById(id);
    if (!discount)
      throw new RpcException({
        code: 404,
        message: `Discount with id ${id} not found`,
      });
    return discount;
  }

  // ── DELETE ──
  async deleteDiscount(id: string) {
    const existing = await this.pricingRepo.findDiscountById(id);
    if (!existing)
      throw new RpcException({
        code: 404,
        message: `Discount with id ${id} not found`,
      });
    return await this.pricingRepo.deleteDiscount(id);
  }
  //==============================================================================================================================CUSTOMER CATEGORY============================================================================================================================================
  async createCustomerCategory(data: CustomerCategoryDto) {
    // Check for duplicate name
    const exists = await this.pricingRepo.findCustomerCategoryByName(data.name);
    if (exists)
      throw new RpcException({
        code: 400,
        message: `Customer category "${data.name}" already exists.`,
      });
    return await this.pricingRepo.createCustomerCategory(data);
  }

  async findAllCustomerCategory() {
    return await this.pricingRepo.findAllCustomerCategory();
  }

  async findCustomerCategoryById(id: string) {
    const category = await this.pricingRepo.findCustomerCategoryById(id);
    if (!category)
      throw new RpcException({
        code: 404,
        message: `Customer category with id ${id} not found.`,
      });
    return category;
  }

  async updateCustomerCategory(id: string, data: UpdateCustomerCategoryDto) {
    const category = await this.pricingRepo.findCustomerCategoryById(id);
    if (!category)
      throw new RpcException({
        code: 404,
        message: `Customer category with id ${id} not found.`,
      });

    if (data.name) {
      const exists = await this.pricingRepo.findCustomerCategoryByName(
        data.name,
      );
      if (exists && exists.id !== id) {
        throw new RpcException({
          code: 400,
          message: `Customer category "${data.name}" already exists.`,
        });
      }
    }
    return await this.pricingRepo.updateCustomerCategory(id, data);
  }

  async deleteCustomerCategory(id: string) {
    const category = await this.pricingRepo.findCustomerCategoryById(id);
    if (!category)
      throw new RpcException({
        code: 404,
        message: `Customer category with id ${id} not found.`,
      });
    return await this.pricingRepo.deleteCustomerCategory(id);
  }
  //==================================================================================================================================================================PRICE CALCULATION LOG=============================================================================================================================================
  async createPriceCalculationLog(data: any): Promise<any> {
    return await this.pricingRepo.createPriceCalculationLog(data);
  }
  async findAllPriceCalculationLog(): Promise<any> {
    return await this.pricingRepo.findAllPriceCalculationLog();
  }
  async findPriceCalculationLogById(id: string): Promise<any> {
    return await this.pricingRepo.findPriceCalculationLogById(id);
  }
  async deletePriceCalculationLog(id: string): Promise<any> {
    return await this.pricingRepo.deletePriceCalculationLog(id);
  }
  //=====================================================================================================PRICE CALCULATION=============================================================================================================================
  // async calculatePrice({
  //   orderId,
  //   userId,
  // }: {
  //   orderId: string;
  //   userId?: string;
  // }) {
  //   console.log('Order calculate price : ', orderId);
  //   console.log('User calculate price : ', userId);

  //   // 1️⃣ Get order and customer
  //   const order = await this.pricingRepo.getOrderById(orderId, {
  //     includeCustomer: true,
  //   });
  //   if (!order) {
  //     throw new RpcException({
  //       code: 404,
  //       message: `Order with id ${orderId} not found`,
  //     });
  //   }
  //   const customer = userId
  //     ? await this.pricingRepo.findCustomerById(userId)
  //     : null;

  //   let category = null;
  //   if (customer?.customerCategoryId) {
  //     category = await this.pricingRepo.findCustomerCategoryById(
  //       customer.customerCategoryId,
  //     );
  //   }
  //   // 2️⃣ Get tariff
  //   const tariff =
  //     await this.pricingRepo.findTariffByScopeAndServiceTypeAndCustomerCategory(
  //       order.shippingScope,
  //       order.serviceType,
  //       category?.id,
  //     );
  //   if (!tariff) {
  //     throw new RpcException({
  //       code: 404,
  //       message: `Tariff not found for order scope ${order.shippingScope}, service type ${order.serviceType} and customer type ${category.name}`,
  //     });
  //   }

  //   const weight = order.weight || 0;
  //   const distance = order.distance || 0;
  //   let breakdown: any = {};

  //   // 3️⃣ Base price
  //   let basePrice =
  //     tariff.baseFee +
  //     (tariff.perKgRate || 0) * weight +
  //     (tariff.perKmRate || 0) * distance;
  //   breakdown.basePrice = basePrice;

  //   // 4️⃣ Misc fees
  //   let miscTotal = 0;
  //   breakdown.miscFees = [];
  //   tariff.miscFees.forEach((fee) => {
  //     // 1️⃣ Check serviceType
  //     if (fee.serviceType && fee.serviceType !== order.serviceType) return;

  //     // 2️⃣ Check dynamic conditions
  //     let applyFee = true;
  //     if (fee.condition) {
  //       for (const [key, value] of Object.entries(fee.condition)) {
  //         const orderValue = (order as any)[key];

  //         if (typeof value === 'object') {
  //           if (value.gte !== undefined && orderValue < value.gte)
  //             applyFee = false;
  //           if (value.lte !== undefined && orderValue > value.lte)
  //             applyFee = false;
  //         } else if (orderValue !== value) {
  //           applyFee = false;
  //         }
  //       }
  //     }
  //     if (!applyFee) return;

  //     // 3️⃣ Apply fee
  //     let feeAmount = 0;
  //     if (fee.isPercentage) feeAmount = (basePrice * fee.amount) / 100;
  //     else if (fee.feeType === 'FLAT') feeAmount = fee.amount;
  //     else if (fee.feeType === 'PER_KG') feeAmount = fee.amount * weight;
  //     else if (fee.feeType === 'PER_KM') feeAmount = fee.amount * distance;

  //     miscTotal += feeAmount;
  //     breakdown.miscFees.push({ name: fee.name, amount: feeAmount });
  //   });

  //   // 5️⃣ Airport fees
  //   let airportFeeTotal = 0;
  //   breakdown.airportFees = [];
  //   tariff.airportFees.forEach((fee) => {
  //     if (!fee.serviceType || fee.serviceType === order.serviceType) {
  //       let feeAmount = 0;
  //       if (fee.perKgRate) feeAmount += fee.perKgRate * weight;
  //       if (fee.flatFee) feeAmount += fee.flatFee;

  //       airportFeeTotal += feeAmount;
  //       breakdown.airportFees.push({
  //         airportCode: fee.airportCode,
  //         amount: feeAmount,
  //       });
  //     }
  //   });

  //   // 6️⃣ Surcharges
  //   let surchargeTotal = 0;
  //   breakdown.surcharges = [];
  //   tariff.surcharges.forEach((s) => {
  //     if (!s.serviceType || s.serviceType === order.serviceType) {
  //       let feeAmount =
  //         s.type === 'percentage'
  //           ? ((basePrice + miscTotal + airportFeeTotal) * s.value) / 100
  //           : s.value;

  //       surchargeTotal += feeAmount;
  //       breakdown.surcharges.push({ name: s.name, amount: feeAmount });
  //     }
  //   });

  //   // 7️⃣ Discounts
  //   let discountTotal = 0;
  //   breakdown.discounts = [];
  //   if (userId) {
  //     // const category =
  //     //   await this.pricingRepo.getCustomerCategoryByUserId(userId);
  //     if (category) {
  //       const discounts = await this.pricingRepo.getDiscountRules(
  //         tariff.id,
  //         category.id,
  //       );
  //       discounts.forEach((d) => {
  //         let discountAmount =
  //           d.type === 'percentage'
  //             ? ((basePrice + miscTotal + airportFeeTotal + surchargeTotal) *
  //                 d.value) /
  //               100
  //             : d.value;

  //         discountTotal += discountAmount;
  //         breakdown.discounts.push({ name: d.name, amount: -discountAmount }); // negative because it reduces price
  //       });
  //     }
  //   }

  //   // 8️⃣ Profit margin
  //   let profitTotal = 0;
  //   breakdown.profitMargins = [];
  //   tariff.profitMargins.forEach((pm) => {
  //     if (!pm.serviceType || pm.serviceType === order.serviceType) {
  //       let pmValue =
  //         (basePrice +
  //           miscTotal +
  //           airportFeeTotal +
  //           surchargeTotal -
  //           discountTotal) *
  //         (pm.percentage / 100);
  //       if (pm.minAmount && pmValue < pm.minAmount) pmValue = pm.minAmount;
  //       if (pm.maxAmount && pmValue > pm.maxAmount) pmValue = pm.maxAmount;

  //       profitTotal += pmValue;
  //       breakdown.profitMargins.push({
  //         percentage: pm.percentage,
  //         amount: pmValue,
  //       });
  //     }
  //   });

  //   // 9️⃣ Final price
  //   const finalPrice =
  //     basePrice +
  //     miscTotal +
  //     airportFeeTotal +
  //     surchargeTotal -
  //     discountTotal +
  //     profitTotal;
  //   breakdown.finalPrice = finalPrice;
  //   // 🔟 Log calculation
  //   await this.pricingRepo.logPriceCalculation({
  //     orderId: order.id,
  //     weight,
  //     distance,
  //     baseRate: basePrice,
  //     appliedRate: basePrice + miscTotal + airportFeeTotal + surchargeTotal,
  //     surcharges: tariff.surcharges.map((s) => ({
  //       name: s.name,
  //       value: s.value,
  //     })),
  //     discounts: discountTotal ? [{ total: discountTotal }] : [],
  //     miscFees: tariff.miscFees.map((f) => ({
  //       name: f.name,
  //       amount: f.amount,
  //     })),
  //     profit: profitTotal ? { total: profitTotal } : {},
  //     airportFee: airportFeeTotal ? { total: airportFeeTotal } : {},
  //     finalPrice,
  //     currency: tariff.currency || 'ETB',
  //   });
  //   return { finalPrice, currency: tariff.currency || 'ETB', breakdown };
  // }

  async calculatePrice(orderId: string, userId?: string) {
    console.log(
      `🔹 Calculating price for Order ID: ${orderId}, User ID: ${userId || 'N/A'}`,
    );

    // 1️⃣ Get order and customer
    const order = await this.pricingRepo.getOrderById(orderId, {
      includeCustomer: true,
    });
    if (!order)
      throw new RpcException({
        code: 404,
        message: `Order ${orderId} not found`,
      });

    const customer = userId
      ? await this.pricingRepo.findCustomerById(userId)
      : null;

    // 2️⃣ Get customer category
    let category = null;
    if (customer?.customerCategoryId) {
      category = await this.pricingRepo.findCustomerCategoryById(
        customer.customerCategoryId,
      );
      console.log(
        `🔹 Customer Category: ${category.name} (ID: ${category.id})`,
      );
    } else {
      console.log('🔹 No customer category assigned');
    }

    // 3️⃣ Get tariff
    const tariff =
      await this.pricingRepo.findTariffByScopeAndServiceTypeAndCustomerCategory(
        order.shippingScope,
        order.serviceType,
        category?.id,
      );
    if (!tariff) {
      throw new RpcException({
        code: 404,
        message: `Tariff not found for scope ${order.shippingScope}, service ${order.serviceType}, category ${category?.name || 'None'}`,
      });
    }

    const weight = order.weight || 0;
    const distance = order.distance || 0;
    const breakdown: any = {};

    // 4️⃣ Base price
    const basePrice =
      tariff.baseFee +
      (tariff.perKgRate || 0) * weight +
      (tariff.perKmRate || 0) * distance;
    breakdown.basePrice = basePrice;

    // 5️⃣ Misc fees
    let miscTotal = 0;
    breakdown.miscFees = [];
    tariff.miscFees.forEach((fee) => {
      if (fee.serviceType && fee.serviceType !== order.serviceType) return;

      let applyFee = true;
      if (fee.condition) {
        for (const [key, value] of Object.entries(fee.condition)) {
          const orderValue = (order as any)[key];
          if (typeof value === 'object') {
            if (value.gte !== undefined && orderValue < value.gte)
              applyFee = false;
            if (value.lte !== undefined && orderValue > value.lte)
              applyFee = false;
          } else if (orderValue !== value) applyFee = false;
        }
      }
      if (!applyFee) return;

      let feeAmount = 0;
      if (fee.isPercentage) feeAmount = (basePrice * fee.amount) / 100;
      else if (fee.feeType === 'FLAT') feeAmount = fee.amount;
      else if (fee.feeType === 'PER_KG') feeAmount = fee.amount * weight;
      else if (fee.feeType === 'PER_KM') feeAmount = fee.amount * distance;

      miscTotal += feeAmount;
      breakdown.miscFees.push({ name: fee.name, amount: feeAmount });
    });

    // 6️⃣ Airport fees
    let airportFeeTotal = 0;
    breakdown.airportFees = [];
    tariff.airportFees.forEach((fee) => {
      if (!fee.serviceType || fee.serviceType === order.serviceType) {
        let feeAmount = (fee.perKgRate || 0) * weight + (fee.flatFee || 0);
        airportFeeTotal += feeAmount;
        breakdown.airportFees.push({
          airportCode: fee.airportCode,
          amount: feeAmount,
        });
      }
    });

    // 7️⃣ Surcharges
    let surchargeTotal = 0;
    breakdown.surcharges = [];
    tariff.surcharges.forEach((s) => {
      if (!s.serviceType || s.serviceType === order.serviceType) {
        const feeAmount =
          s.type === 'percentage'
            ? ((basePrice + miscTotal + airportFeeTotal) * s.value) / 100
            : s.value;

        surchargeTotal += feeAmount;
        breakdown.surcharges.push({ name: s.name, amount: feeAmount });
      }
    });

    // 8️⃣ Discounts
    let discountTotal = 0;
    breakdown.discounts = [];
    if (category) {
      const discounts = await this.pricingRepo.getDiscountRules(
        tariff.id,
        category.id,
      );
      discounts.forEach((d) => {
        const discountAmount =
          d.type === 'percentage'
            ? ((basePrice + miscTotal + airportFeeTotal + surchargeTotal) *
                d.value) /
              100
            : d.value;

        discountTotal += discountAmount;
        breakdown.discounts.push({ name: d.name, amount: -discountAmount });
      });
    }

    // 9️⃣ Profit margin
    let profitTotal = 0;
    breakdown.profitMargins = [];
    tariff.profitMargins.forEach((pm) => {
      if (!pm.serviceType || pm.serviceType === order.serviceType) {
        let pmValue =
          (basePrice +
            miscTotal +
            airportFeeTotal +
            surchargeTotal -
            discountTotal) *
          (pm.percentage / 100);
        if (pm.minAmount && pmValue < pm.minAmount) pmValue = pm.minAmount;
        if (pm.maxAmount && pmValue > pm.maxAmount) pmValue = pm.maxAmount;

        profitTotal += pmValue;
        breakdown.profitMargins.push({
          percentage: pm.percentage,
          amount: pmValue,
        });
      }
    });

    // 🔟 Final price
    const finalPrice =
      basePrice +
      miscTotal +
      airportFeeTotal +
      surchargeTotal -
      discountTotal +
      profitTotal;
    breakdown.finalPrice = finalPrice;

    // 1️⃣1️⃣ Log cleanly
    console.log('🔹 Price breakdown:', JSON.stringify(breakdown, null, 2));

    await this.pricingRepo.logPriceCalculationAndUpdateOrder({
      orderId: order.id,
      weight,
      distance,
      baseRate: basePrice,
      appliedRate: basePrice + miscTotal + airportFeeTotal + surchargeTotal,
      surcharges: breakdown.surcharges,
      discounts: breakdown.discounts,
      miscFees: breakdown.miscFees,
      profit: { total: profitTotal },
      airportFee: { total: airportFeeTotal },
      finalPrice,
      currency: tariff.currency || 'ETB',
    });

    return { finalPrice, currency: tariff.currency || 'ETB', breakdown };
  }
}
