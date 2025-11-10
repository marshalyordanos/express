import { PrismaService } from '../../prisma/prisma.service';
import { AddressDto, CreateDriver, CustomerCategoryDto, NotificationPreferencesDto, PreferencesDto, UpdateCorporateInfoDto, UpdateCustomerCategoryDto, UserUpdateDto } from './user.entity';
import { CorporateInfo, User } from '@prisma/client';
import { ListQueryDto } from '../../common/query/query.dto';
export declare class UserRepository {
    private prisma;
    constructor(prisma: PrismaService);
    findUserById(id: string): Promise<User | null>;
    findAddressById(id: string): Promise<{
        label: string;
        id: string;
        branchId: string | null;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        userId: string | null;
        addressLine: string;
        city: string;
        state: string | null;
        country: string;
        postalCode: string | null;
        lat: string | null;
        long: string | null;
        purpose: import(".prisma/client").$Enums.AddressPurpose;
    }>;
    findAll(payload: ListQueryDto): Promise<{
        models: {
            name: string;
            role: {
                name: string;
                id: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
                createdBy: string | null;
            };
            email: string;
            phone: string;
            createdAt: Date;
            isStaff: boolean;
            isSuperAdmin: boolean;
            customerType: import(".prisma/client").$Enums.CustomerType;
            branch: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                createdBy: string | null;
                location: string;
                managerId: string | null;
            };
            addresses: {
                label: string;
                id: string;
                branchId: string | null;
                createdAt: Date;
                updatedAt: Date;
                createdBy: string | null;
                userId: string | null;
                addressLine: string;
                city: string;
                state: string | null;
                country: string;
                postalCode: string | null;
                lat: string | null;
                long: string | null;
                purpose: import(".prisma/client").$Enums.AddressPurpose;
            }[];
            preferences: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                createdBy: string | null;
                userId: string;
                defaultPayment: string | null;
                defaultDropoffBranch: string | null;
                deliveryNotes: string | null;
            };
            corporateInfo: {
                createdBy: string | null;
                userId: string;
                companyName: string;
                taxId: string | null;
                registrationNo: string | null;
                contactPerson: string | null;
                contactPhone: string | null;
                contactEmail: string | null;
                industryType: string | null;
                website: string | null;
                address: string | null;
                notes: string | null;
            };
        }[];
        pagination: {
            total: number;
            page: number;
            pageSize: number;
            totalPages: number;
        };
    }>;
    getAllCustomer(payload: ListQueryDto, roleId: string): Promise<{
        models: {
            name: string;
            role: {
                name: string;
                id: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
                createdBy: string | null;
            };
            email: string;
            phone: string;
            createdAt: Date;
            isStaff: boolean;
            isSuperAdmin: boolean;
            customerType: import(".prisma/client").$Enums.CustomerType;
            branch: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                createdBy: string | null;
                location: string;
                managerId: string | null;
            };
            addresses: {
                label: string;
                id: string;
                branchId: string | null;
                createdAt: Date;
                updatedAt: Date;
                createdBy: string | null;
                userId: string | null;
                addressLine: string;
                city: string;
                state: string | null;
                country: string;
                postalCode: string | null;
                lat: string | null;
                long: string | null;
                purpose: import(".prisma/client").$Enums.AddressPurpose;
            }[];
            preferences: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                createdBy: string | null;
                userId: string;
                defaultPayment: string | null;
                defaultDropoffBranch: string | null;
                deliveryNotes: string | null;
            };
            corporateInfo: {
                createdBy: string | null;
                userId: string;
                companyName: string;
                taxId: string | null;
                registrationNo: string | null;
                contactPerson: string | null;
                contactPhone: string | null;
                contactEmail: string | null;
                industryType: string | null;
                website: string | null;
                address: string | null;
                notes: string | null;
            };
        }[];
        pagination: {
            total: number;
            page: number;
            pageSize: number;
            totalPages: number;
        };
    }>;
    updateUser(id: string, data: Partial<UserUpdateDto>): Promise<User>;
    deleteUser(id: string): Promise<User>;
    findUserByEmail(email: string): Promise<User | null>;
    addAddress(data: AddressDto): Promise<{
        label: string;
        id: string;
        branchId: string | null;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        userId: string | null;
        addressLine: string;
        city: string;
        state: string | null;
        country: string;
        postalCode: string | null;
        lat: string | null;
        long: string | null;
        purpose: import(".prisma/client").$Enums.AddressPurpose;
    }>;
    listAddresses(userId: string): Promise<{
        label: string;
        id: string;
        branchId: string | null;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        userId: string | null;
        addressLine: string;
        city: string;
        state: string | null;
        country: string;
        postalCode: string | null;
        lat: string | null;
        long: string | null;
        purpose: import(".prisma/client").$Enums.AddressPurpose;
    }[]>;
    updateAddress(id: string, data: any): Promise<{
        label: string;
        id: string;
        branchId: string | null;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        userId: string | null;
        addressLine: string;
        city: string;
        state: string | null;
        country: string;
        postalCode: string | null;
        lat: string | null;
        long: string | null;
        purpose: import(".prisma/client").$Enums.AddressPurpose;
    }>;
    deleteAddress(id: string): Promise<{
        label: string;
        id: string;
        branchId: string | null;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        userId: string | null;
        addressLine: string;
        city: string;
        state: string | null;
        country: string;
        postalCode: string | null;
        lat: string | null;
        long: string | null;
        purpose: import(".prisma/client").$Enums.AddressPurpose;
    }>;
    updatePreferences(userId: string, data: PreferencesDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        userId: string;
        defaultPayment: string | null;
        defaultDropoffBranch: string | null;
        deliveryNotes: string | null;
    }>;
    updateCorporateInfo(userId: string, data: UpdateCorporateInfoDto): Promise<CorporateInfo>;
    getCustomerOrders(payload: ListQueryDto, id: string): Promise<any>;
    findRoleByName(name: string): Promise<{
        name: string;
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
    }>;
    listCategories(payload: ListQueryDto): Promise<{
        models: ({
            users: {
                password: string;
                name: string;
                id: string;
                email: string;
                phone: string | null;
                branchId: string | null;
                createdAt: Date;
                updatedAt: Date;
                emailVerified: boolean;
                roleId: string | null;
                isStaff: boolean;
                isSuperAdmin: boolean;
                customerType: import(".prisma/client").$Enums.CustomerType | null;
                customerCategoryId: string | null;
                createdBy: string | null;
            }[];
            tariffs: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                customerCategoryId: string | null;
                createdBy: string | null;
                serviceType: import(".prisma/client").$Enums.ServiceType;
                shippingScope: import(".prisma/client").$Enums.ShippingScope | null;
                currency: string;
                baseFee: number;
                perKmRate: number;
                perKgRate: number;
                isActive: boolean;
                effectiveFrom: Date;
                effectiveTo: Date | null;
            }[];
            pricingRules: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                customerCategoryId: string | null;
                createdBy: string | null;
                shippingScope: import(".prisma/client").$Enums.ShippingScope;
                validFrom: Date;
                validTo: Date | null;
                adjustmentType: string;
                adjustmentValue: number;
            }[];
            discountRules: {
                value: number;
                type: string;
                name: string;
                id: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
                customerCategoryId: string | null;
                createdBy: string | null;
                serviceType: import(".prisma/client").$Enums.ServiceType | null;
                shippingScope: import(".prisma/client").$Enums.ShippingScope | null;
                tariffId: string;
                isActive: boolean;
                validFrom: Date;
                validTo: Date | null;
            }[];
        } & {
            name: string;
            id: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
        })[];
        pagination: {
            total: number;
            page: number;
            pageSize: number;
            totalPages: number;
        };
    }>;
    deleteCategory(id: string): Promise<{
        name: string;
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
    }>;
    findCategory(id: string): Promise<{
        name: string;
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
    }>;
    updateCategory(id: string, data: Partial<UpdateCustomerCategoryDto>): Promise<{
        name: string;
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
    }>;
    createCategory(data: CustomerCategoryDto): Promise<{
        name: string;
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
    }>;
    assignCustomersToCategory(customerIds: string[], customerCategoryId: string): Promise<{
        password: string;
        name: string;
        id: string;
        email: string;
        phone: string | null;
        branchId: string | null;
        createdAt: Date;
        updatedAt: Date;
        emailVerified: boolean;
        roleId: string | null;
        isStaff: boolean;
        isSuperAdmin: boolean;
        customerType: import(".prisma/client").$Enums.CustomerType | null;
        customerCategoryId: string | null;
        createdBy: string | null;
    }[]>;
    removeCustomersFromCategory(customerIds: string[]): Promise<{
        password: string;
        name: string;
        id: string;
        email: string;
        phone: string | null;
        branchId: string | null;
        createdAt: Date;
        updatedAt: Date;
        emailVerified: boolean;
        roleId: string | null;
        isStaff: boolean;
        isSuperAdmin: boolean;
        customerType: import(".prisma/client").$Enums.CustomerType | null;
        customerCategoryId: string | null;
        createdBy: string | null;
    }[]>;
    updateUserNotificationPreferences(userId: string, data: NotificationPreferencesDto): Promise<{
        push: boolean;
        id: string;
        email: boolean;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        inApp: boolean;
    }>;
    getUserNotificationPreferences(userId: string): Promise<{
        push: boolean;
        id: string;
        email: boolean;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        inApp: boolean;
    }>;
    createUserNotificationPreferences(userId: string): Promise<{
        push: boolean;
        id: string;
        email: boolean;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        inApp: boolean;
    }>;
    createDriver(data: CreateDriver): Promise<{
        type: import(".prisma/client").$Enums.DriverType;
        status: import(".prisma/client").$Enums.DriverStatus;
        id: string;
        updatedAt: Date | null;
        createdBy: string | null;
        userId: string;
        vehicleId: string | null;
        currentLat: number | null;
        currentLon: number | null;
    }>;
    findVehicleById(vehicleId: string): Promise<{
        type: string;
        status: import(".prisma/client").$Enums.VehicleStatus;
        id: string;
        model: string | null;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        plateNumber: string;
        driverId: string | null;
    }>;
    findDriver(payload: ListQueryDto): Promise<{
        drivers: ({
            user: {
                name: string;
                id: string;
                email: string;
                phone: string;
            };
            vehicles: {
                status: import(".prisma/client").$Enums.VehicleStatus;
                id: string;
                model: string;
                plateNumber: string;
            }[];
        } & {
            type: import(".prisma/client").$Enums.DriverType;
            status: import(".prisma/client").$Enums.DriverStatus;
            id: string;
            updatedAt: Date | null;
            createdBy: string | null;
            userId: string;
            vehicleId: string | null;
            currentLat: number | null;
            currentLon: number | null;
        })[];
        pagination: {
            total: number;
            page: number;
            pageSize: number;
            totalPages: number;
        };
    }>;
}
