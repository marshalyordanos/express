import { UserRepository } from './user.repository';
import { AddressDto, AddressUpdateDto, CreateDriver, CustomerCategoryDto, NotificationPreferencesDto, PreferencesDto, UpdateCorporateInfoDto, UpdateCustomerCategoryDto, UserDto } from './user.entity';
import { Address, User } from '@prisma/client';
import { UserUsecase } from './user.usecase';
import { ListQueryDto } from 'src/common/query/query.dto';
import { AppLogger } from '../../common/app-logger.service';
export declare class UserUseCasesImp implements UserUsecase {
    private readonly userRepo;
    private readonly logger;
    constructor(userRepo: UserRepository, logger: AppLogger);
    findUserByEmail(email: string): Promise<User | null>;
    getUser(id: string): Promise<User>;
    getAllUsers(query: ListQueryDto): Promise<{
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
    updateUser(id: string, data: Partial<UserDto>): Promise<User>;
    deleteUser(id: string): Promise<User>;
    addAddress(data: AddressDto): Promise<Address>;
    listAddresses(userId: string): Promise<Address[]>;
    updateAddress(id: string, data: Partial<AddressUpdateDto>, userId: string): Promise<Address>;
    deleteAddress(id: string): Promise<string>;
    updatePreferences(userId: string, data: PreferencesDto, user: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        userId: string;
        defaultPayment: string | null;
        defaultDropoffBranch: string | null;
        deliveryNotes: string | null;
    }>;
    updateCorporateInfo(userId: string, data: UpdateCorporateInfoDto): Promise<{
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
    }>;
    getCustomerOrder(query: ListQueryDto, customerId: string): Promise<any>;
    getAllCustomer(query: ListQueryDto): Promise<{
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
    findCategoryByName(name: string): Promise<void>;
    deleteCategory(id: string): Promise<string>;
    updateCategory(id: string, data: UpdateCustomerCategoryDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        description: string | null;
    }>;
    listCategories(query: ListQueryDto): Promise<{
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
    findCategory(id: string): Promise<{
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
    createUserNotificationPreference(userId: string): Promise<{
        email: boolean;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        inApp: boolean;
        push: boolean;
        userId: string;
    }>;
    updateUserNotificationPreference(data: NotificationPreferencesDto, userId: string): Promise<{
        email: boolean;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        inApp: boolean;
        push: boolean;
        userId: string;
    }>;
    getUserNotificationPreference(userId: string): Promise<{
        email: boolean;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        inApp: boolean;
        push: boolean;
        userId: string;
    }>;
    createDriver(data: CreateDriver, userId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            driver: {
                vehicleId: string;
                roleId: string;
                id: string;
                type: import(".prisma/client").$Enums.DriverType;
                status: import(".prisma/client").$Enums.DriverStatus;
                licenseNumber: string;
                licenseExpiry: Date;
            };
            name: string;
            email: string;
            phone: string;
            id: string;
            roleId: string;
        };
    }>;
    findDriver(query: ListQueryDto): Promise<{
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
