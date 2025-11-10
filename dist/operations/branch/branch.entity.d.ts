import { AddressPurpose } from '@prisma/client';
export interface BranchResponseDto {
    id: string;
    name: string;
    location: string;
    managerId?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class UpdateAddressDto {
    label?: string;
    addressLine?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    lat?: string;
    long?: string;
    purpose?: AddressPurpose;
}
export declare class BranchUpdateDto {
    name?: string;
    location?: string;
    managerId?: string;
    address?: UpdateAddressDto;
}
export declare class AssignManagerDto {
    managerId?: string;
    branchId?: string;
}
export declare class CreateAddressDto {
    label: string;
    addressLine: string;
    city: string;
    state?: string;
    country: string;
    postalCode?: string;
    lat?: number;
    long?: number;
    purpose: string;
    branchId?: string;
}
declare const PartialAddressDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateAddressDto>>;
export declare class PartialAddressDto extends PartialAddressDto_base {
}
export declare class BranchCreateDto {
    name: string;
    location: string;
    managerId?: string;
    address?: PartialAddressDto;
}
export {};
