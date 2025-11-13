import { UserUseCasesImp } from './user.usecase.impl';
import { AddressDto, CreateDriver, CustomerCategoryDto, NotificationPreferencesDto, PreferencesDto, UpdateCorporateInfoDto, UpdateCustomerCategoryDto, UserDto } from './user.entity';
import { IResponse } from '../../common/types';
import { ListQueryDto } from '../../common/query/query.dto';
export declare class UserMessageController {
    private readonly usecases;
    constructor(usecases: UserUseCasesImp);
    findById(payload: {
        id: string;
    }): Promise<IResponse<{
        password: string;
        name: string;
        id: string;
        customId: string | null;
        email: string;
        phone: string | null;
        branchId: string | null;
        createdAt: Date;
        updatedAt: Date;
        emailVerified: boolean;
        roleId: string | null;
        isStaff: boolean;
        isSuperAdmin: boolean;
        emergencyContactName: string | null;
        emergencyContactPhone: string | null;
        isActive: boolean;
        customerType: import(".prisma/client").$Enums.CustomerType | null;
        customerCategoryId: string | null;
        createdBy: string | null;
    }>>;
    findAll(payload: {
        query: ListQueryDto;
    }): Promise<IResponse<{
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
    }[]>>;
    update(payload: {
        data: Partial<UserDto>;
        user: any;
    }): Promise<IResponse<{
        password: string;
        name: string;
        id: string;
        customId: string | null;
        email: string;
        phone: string | null;
        branchId: string | null;
        createdAt: Date;
        updatedAt: Date;
        emailVerified: boolean;
        roleId: string | null;
        isStaff: boolean;
        isSuperAdmin: boolean;
        emergencyContactName: string | null;
        emergencyContactPhone: string | null;
        isActive: boolean;
        customerType: import(".prisma/client").$Enums.CustomerType | null;
        customerCategoryId: string | null;
        createdBy: string | null;
    }>>;
    deleteUser(payload: {
        id: string;
    }): Promise<IResponse<{
        password: string;
        name: string;
        id: string;
        customId: string | null;
        email: string;
        phone: string | null;
        branchId: string | null;
        createdAt: Date;
        updatedAt: Date;
        emailVerified: boolean;
        roleId: string | null;
        isStaff: boolean;
        isSuperAdmin: boolean;
        emergencyContactName: string | null;
        emergencyContactPhone: string | null;
        isActive: boolean;
        customerType: import(".prisma/client").$Enums.CustomerType | null;
        customerCategoryId: string | null;
        createdBy: string | null;
    }>>;
    findByEmail(payload: {
        email: string;
    }): Promise<IResponse<{
        password: string;
        name: string;
        id: string;
        customId: string | null;
        email: string;
        phone: string | null;
        branchId: string | null;
        createdAt: Date;
        updatedAt: Date;
        emailVerified: boolean;
        roleId: string | null;
        isStaff: boolean;
        isSuperAdmin: boolean;
        emergencyContactName: string | null;
        emergencyContactPhone: string | null;
        isActive: boolean;
        customerType: import(".prisma/client").$Enums.CustomerType | null;
        customerCategoryId: string | null;
        createdBy: string | null;
    }>>;
    addAddress(payload: {
        data: AddressDto;
    }): Promise<IResponse<{
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
    }>>;
    listAddresses(data: any): Promise<IResponse<{
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
    }[]>>;
    updateAddress(payload: {
        id: string;
        data: any;
        user: any;
    }): Promise<IResponse<{
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
    }>>;
    deleteAddress(payload: {
        id: string;
    }): Promise<IResponse<string>>;
    updatePreferences(payload: {
        userId: string;
        data: PreferencesDto;
        user: any;
    }): Promise<IResponse<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        userId: string;
        defaultPayment: string | null;
        defaultDropoffBranch: string | null;
        deliveryNotes: string | null;
    }>>;
    updateCorporateInfo(payload: {
        userId: string;
        data: UpdateCorporateInfoDto;
    }): Promise<IResponse<{
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
    }>>;
    findAllCustomers(payload: {
        query: ListQueryDto;
    }): Promise<IResponse<{
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
    }[]>>;
    getCustomerOrder(payload: {
        user: any;
        query: ListQueryDto;
    }): Promise<IResponse<any>>;
    createCategory(payload: {
        data: CustomerCategoryDto;
    }): Promise<IResponse<{
        name: string;
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
    }>>;
    listCategories(payload: {
        query: ListQueryDto;
    }): Promise<IResponse<{
        models: ({
            users: {
                password: string;
                name: string;
                id: string;
                customId: string | null;
                email: string;
                phone: string | null;
                branchId: string | null;
                createdAt: Date;
                updatedAt: Date;
                emailVerified: boolean;
                roleId: string | null;
                isStaff: boolean;
                isSuperAdmin: boolean;
                emergencyContactName: string | null;
                emergencyContactPhone: string | null;
                isActive: boolean;
                customerType: import(".prisma/client").$Enums.CustomerType | null;
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
                currency: string;
                baseFee: number;
                perKmRate: number;
                perKgRate: number;
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
                isActive: boolean;
                customerCategoryId: string | null;
                createdBy: string | null;
                serviceType: import(".prisma/client").$Enums.ServiceType | null;
                shippingScope: import(".prisma/client").$Enums.ShippingScope | null;
                tariffId: string;
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
    }>>;
    findCategory(payload: {
        id: string;
    }): Promise<IResponse<{
        name: string;
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
    }>>;
    updateCategory(payload: {
        id: string;
        data: UpdateCustomerCategoryDto;
    }): Promise<IResponse<{
        name: string;
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
    }>>;
    deleteCategory(payload: {
        id: string;
    }): Promise<IResponse<string>>;
    findCategoryByName(payload: {
        name: string;
    }): Promise<IResponse<void>>;
    assignCategoryToUser(payload: {
        data: {
            customerIds: string[];
            customerCategoryId: string;
        };
    }): Promise<IResponse<{
        password: string;
        name: string;
        id: string;
        customId: string | null;
        email: string;
        phone: string | null;
        branchId: string | null;
        createdAt: Date;
        updatedAt: Date;
        emailVerified: boolean;
        roleId: string | null;
        isStaff: boolean;
        isSuperAdmin: boolean;
        emergencyContactName: string | null;
        emergencyContactPhone: string | null;
        isActive: boolean;
        customerType: import(".prisma/client").$Enums.CustomerType | null;
        customerCategoryId: string | null;
        createdBy: string | null;
    }[]>>;
    unassignCategoryToUser(payload: {
        customerIds: string[];
        customerCategoryId: string;
    }): Promise<IResponse<{
        password: string;
        name: string;
        id: string;
        customId: string | null;
        email: string;
        phone: string | null;
        branchId: string | null;
        createdAt: Date;
        updatedAt: Date;
        emailVerified: boolean;
        roleId: string | null;
        isStaff: boolean;
        isSuperAdmin: boolean;
        emergencyContactName: string | null;
        emergencyContactPhone: string | null;
        isActive: boolean;
        customerType: import(".prisma/client").$Enums.CustomerType | null;
        customerCategoryId: string | null;
        createdBy: string | null;
    }[]>>;
    createUserNotificationPreference(payload: {
        user: any;
    }): Promise<IResponse<{
        push: boolean;
        id: string;
        email: boolean;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        inApp: boolean;
    }>>;
    updateUserNotificationPreference(payload: {
        user: any;
        data: NotificationPreferencesDto;
    }): Promise<IResponse<{
        push: boolean;
        id: string;
        email: boolean;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        inApp: boolean;
    }>>;
    getUserNotificationPreference(payload: {
        user: any;
    }): Promise<IResponse<{
        push: boolean;
        id: string;
        email: boolean;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        inApp: boolean;
    }>>;
    createDriver(payload: {
        data: CreateDriver;
        user: any;
    }): Promise<IResponse<{
        success: boolean;
        message: string;
        data: {
            driver: {
                vehicleId: string;
                roleId: string;
                type: import(".prisma/client").$Enums.DriverType;
                status: import(".prisma/client").$Enums.DriverStatus;
                id: string;
                licenseNumber: string;
                licenseExpiry: Date;
            };
            name: string;
            id: string;
            email: string;
            phone: string;
            roleId: string;
        };
    }>>;
    findDriver(payload: {
        query: ListQueryDto;
    }): Promise<IResponse<{
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
            licenseNumber: string | null;
            licenseExpiry: Date | null;
            currentLat: number | null;
            currentLon: number | null;
        })[];
        pagination: {
            total: number;
            page: number;
            pageSize: number;
            totalPages: number;
        };
    }>>;
}
