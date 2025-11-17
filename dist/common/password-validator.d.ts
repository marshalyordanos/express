export declare class PasswordValidator {
    static validate(newPassword: string, currentPassword?: string): {
        isValid: boolean;
        message: string;
    };
}
