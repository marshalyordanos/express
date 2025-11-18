import { PrismaService } from '../../prisma/prisma.service';
import { AddressDto, CreateDriver, CustomerCategoryDto, NotificationPreferencesDto, PreferencesDto, UpdateCorporateInfoDto, UpdateCustomerCategoryDto, UserUpdateDto } from './user.entity';
import { CorporateInfo, User } from '@prisma/client';
import { ListQueryDto } from '../../common/query/query.dto';
export declare class UserRepository {
    private prisma;
    constructor(prisma: PrismaService);
    findRoleById(roleId: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        description: string | null;
    }>;
    findUserById(id: string): Promise<User | null>;
    findAddressById(id: string): Promise<{
        branchId: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        userId: string | null;
        label: string;
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
            email: string;
            role: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                createdBy: string | null;
                description: string | null;
            };
            customerType: import(".prisma/client").$Enums.CustomerType;
            phone: string;
            createdAt: Date;
            isStaff: boolean;
            isSuperAdmin: boolean;
            corporateInfo: {
                companyName: string;
                taxId: string | null;
                contactPerson: string | null;
                contactPhone: string | null;
                contactEmail: string | null;
                industryType: string | null;
                website: string | null;
                address: string | null;
                notes: string | null;
                createdBy: string | null;
                userId: string;
                registrationNo: string | null;
            };
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
                branchId: string | null;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                createdBy: string | null;
                userId: string | null;
                label: string;
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
            email: string;
            role: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                createdBy: string | null;
                description: string | null;
            };
            customerType: import(".prisma/client").$Enums.CustomerType;
            phone: string;
            createdAt: Date;
            isStaff: boolean;
            isSuperAdmin: boolean;
            corporateInfo: {
                companyName: string;
                taxId: string | null;
                contactPerson: string | null;
                contactPhone: string | null;
                contactEmail: string | null;
                industryType: string | null;
                website: string | null;
                address: string | null;
                notes: string | null;
                createdBy: string | null;
                userId: string;
                registrationNo: string | null;
            };
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
                branchId: string | null;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                createdBy: string | null;
                userId: string | null;
                label: string;
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
        branchId: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        userId: string | null;
        label: string;
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
        branchId: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        userId: string | null;
        label: string;
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
        branchId: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        userId: string | null;
        label: string;
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
        branchId: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        userId: string | null;
        label: string;
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
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        description: string | null;
    }>;
    listCategories(payload: ListQueryDto): Promise<{
        models: ({
            users: {
                name: string;
                email: string;
                password: string;
                branchId: string | null;
                customerType: import(".prisma/client").$Enums.CustomerType | null;
                phone: string | null;
                id: string;
                customId: string | null;
                createdAt: Date;
                updatedAt: Date;
                emailVerified: boolean;
                roleId: string | null;
                isStaff: boolean;
                isSuperAdmin: boolean;
                emergencyContactName: string | null;
                emergencyContactPhone: string | null;
                isActive: boolean;
                customerCategoryId: string | null;
                createdBy: string | null;
            }[];
            tariffs: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                isActive: boolean;
                customerCategoryId: string | null;
                createdBy: string | null;
                serviceType: import(".prisma/client").$Enums.ServiceType;
                shippingScope: import(".prisma/client").$Enums.ShippingScope | null;
                baseFee: number;
                perKgRate: number;
                perKmRate: number;
                currency: string;
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
                name: string;
                value: number;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                isActive: boolean;
                customerCategoryId: string | null;
                createdBy: string | null;
                description: string | null;
                type: string;
                serviceType: import(".prisma/client").$Enums.ServiceType | null;
                shippingScope: import(".prisma/client").$Enums.ShippingScope | null;
                tariffId: string;
                validFrom: Date;
                validTo: Date | null;
            }[];
        } & {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            description: string | null;
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
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        description: string | null;
    }>;
    findCategory(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        description: string | null;
    }>;
    updateCategory(id: string, data: Partial<UpdateCustomerCategoryDto>): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        description: string | null;
    }>;
    createCategory(data: CustomerCategoryDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        description: string | null;
    }>;
    assignCustomersToCategory(customerIds: string[], customerCategoryId: string): Promise<{
        name: string;
        email: string;
        password: string;
        branchId: string | null;
        customerType: import(".prisma/client").$Enums.CustomerType | null;
        phone: string | null;
        id: string;
        customId: string | null;
        createdAt: Date;
        updatedAt: Date;
        emailVerified: boolean;
        roleId: string | null;
        isStaff: boolean;
        isSuperAdmin: boolean;
        emergencyContactName: string | null;
        emergencyContactPhone: string | null;
        isActive: boolean;
        customerCategoryId: string | null;
        createdBy: string | null;
    }[]>;
    removeCustomersFromCategory(customerIds: string[]): Promise<{
        name: string;
        email: string;
        password: string;
        branchId: string | null;
        customerType: import(".prisma/client").$Enums.CustomerType | null;
        phone: string | null;
        id: string;
        customId: string | null;
        createdAt: Date;
        updatedAt: Date;
        emailVerified: boolean;
        roleId: string | null;
        isStaff: boolean;
        isSuperAdmin: boolean;
        emergencyContactName: string | null;
        emergencyContactPhone: string | null;
        isActive: boolean;
        customerCategoryId: string | null;
        createdBy: string | null;
    }[]>;
    updateUserNotificationPreferences(userId: string, data: NotificationPreferencesDto): Promise<{
        email: boolean;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        inApp: boolean;
        push: boolean;
        userId: string;
    }>;
    getUserNotificationPreferences(userId: string): Promise<{
        email: boolean;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        inApp: boolean;
        push: boolean;
        userId: string;
    }>;
    createUserNotificationPreferences(userId: string): Promise<{
        email: boolean;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        inApp: boolean;
        push: boolean;
        userId: string;
    }>;
    createDriver(data: CreateDriver, userId: string): Promise<{
        user: {
            name: string;
            email: string;
            phone: string;
            id: string;
            roleId: string;
        };
        driver: {
            id: string;
            type: import(".prisma/client").$Enums.DriverType;
            status: import(".prisma/client").$Enums.DriverStatus;
            vehicleId: string;
            licenseNumber: string;
            licenseExpiry: Date;
        };
    }>;
    findVehicleById(vehicleId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        type: string;
        driverId: string | null;
        status: import(".prisma/client").$Enums.VehicleStatus;
        plateNumber: string;
        model: string | null;
        maxLoad: number | null;
    }>;
    findDriver(payload: ListQueryDto): Promise<{
        drivers: ({
            user: {
                name: string;
                email: string;
                phone: string;
                id: string;
            };
            vehicles: {
                id: string;
                status: import(".prisma/client").$Enums.VehicleStatus;
                plateNumber: string;
                model: string;
            }[];
        } & {
            id: string;
            updatedAt: Date | null;
            createdBy: string | null;
            userId: string;
            type: import(".prisma/client").$Enums.DriverType;
            status: import(".prisma/client").$Enums.DriverStatus;
            vehicleId: string | null;
            availablityStatus: import(".prisma/client").$Enums.DriverAvailabilityStatus;
            licenseNumber: string | null;
            licenseExpiry: Date | null;
            licenseIssue: Date | null;
            frontImageUrl: string | null;
            backImageUrl: string | null;
            verifiedByOCR: boolean;
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
