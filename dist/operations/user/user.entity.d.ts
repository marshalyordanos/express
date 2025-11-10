import { AddressPurpose, DriverStatus, DriverType } from '@prisma/client';
export interface UserDto {
    name: string;
    email: string;
    password: string;
    role?: string;
    branchId?: string;
    phone?: string;
}
export declare class UserUpdateDto {
    name: string;
    email: string;
    password: string;
    branchId?: string;
    phone?: string;
}
export declare class ChangeRoleDto {
    role: string;
    userId: string;
}
export interface AddressDto {
    id?: string;
    label: string;
    addressLine: string;
    city: string;
    state?: string;
    country: string;
    postalCode?: string;
    lat?: string;
    long?: string;
    userId: string;
    purpose: AddressPurpose;
}
export interface PreferencesDto {
    defaultPayment?: string;
    defaultDropoffBranch?: string;
    deliveryNotes?: string;
}
export declare class AddressUpdateDto {
    label?: string;
    addressLine?: string;
    city?: string;
    state?: string;
    country?: string;
    lat?: string;
    long?: string;
    postalCode?: string;
}
export declare class UpdateCorporateInfoDto {
    companyName?: string;
    taxId?: string;
    contactPerson?: string;
    contactPhone?: string;
    contactEmail?: string;
    industryType?: string;
    website?: string;
    address?: string;
    notes?: string;
}
export declare class CustomerCategoryDto {
    name: string;
    description: string;
}
export declare class UpdateCustomerCategoryDto {
    name?: string;
    description?: string;
}
export declare class AssignCustomerToCategory {
    customerIds: string[];
    customerCategoryId: string;
}
export declare class UnAssignCustomerToCategory {
    customerIds: string[];
}
export declare class NotificationPreferencesDto {
    email?: boolean;
    inApp?: boolean;
    push?: boolean;
    userId: string;
}
export declare class CreateDriver {
    userId: string;
    vehicleId: string;
    status: DriverStatus;
    type: DriverType;
    currentLat: number;
    currentLong: number;
}
