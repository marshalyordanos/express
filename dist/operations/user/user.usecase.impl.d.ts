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
    }>;
    getCustomerOrder(query: ListQueryDto, customerId: string): Promise<any>;
    getAllCustomer(query: ListQueryDto): Promise<{
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
    findCategoryByName(name: string): Promise<void>;
    deleteCategory(id: string): Promise<string>;
    updateCategory(id: string, data: UpdateCustomerCategoryDto): Promise<{
        name: string;
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
    }>;
    listCategories(query: ListQueryDto): Promise<{
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
    findCategory(id: string): Promise<{
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
    createUserNotificationPreference(userId: string): Promise<{
        push: boolean;
        id: string;
        email: boolean;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        inApp: boolean;
    }>;
    updateUserNotificationPreference(data: NotificationPreferencesDto, userId: string): Promise<{
        push: boolean;
        id: string;
        email: boolean;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        inApp: boolean;
    }>;
    getUserNotificationPreference(userId: string): Promise<{
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
    findDriver(query: ListQueryDto): Promise<{
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
