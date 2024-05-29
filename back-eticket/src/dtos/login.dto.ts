import { IsEmail, IsNotEmpty, IsString, Matches } from "class-validator";

export class LoginUserDto {
    /**
     * This is the email of the user
     * @example 'x8l8c@example.com'
     */
    @IsEmail()
    @IsNotEmpty({message: 'Email required'})
    email: string

    /**
     * This is the password of the user
     * @example 'Password#123'
     */
    @IsString({ message: 'password must be a string' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,15}$/, {
        message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*), and be between 8 and 15 characters long.',
    })
    password: string
}