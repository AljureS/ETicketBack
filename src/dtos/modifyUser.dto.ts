import { IsEmail, IsEmpty, IsNotEmpty, IsNumber, IsOptional, IsString, Length, Matches, Validate } from "class-validator"
import { MatchingPassword } from "src/decorators/matchingPassword.decorator"

export class modifyUserDto { 
    /**
    This is the name of the user 
    @example 'Cristiano'
     */
    @IsOptional()
    @Length(3, 80, { message: 'El nombre debe tener entre 3 y 80 caracteres.' })
    @IsString({ message: 'name must be a string' })
    name: string
    
    /**
    This is the name of the user 
    @example 'Cristiano'
     */
    @IsOptional()
    @Length(3, 80, { message: 'El nombre debe tener entre 3 y 80 caracteres.' })
    @IsString({ message: 'name must be a string' })
    lastName: string

    /**
     * This is the phone of the user
     * @example '123456789'
     */
    @IsString()
    @IsOptional()
    phone: string 

    /**
     * This is the email of the user
     * @example 'x8l8c@example.com'
     */
    @IsEmail()
    @IsOptional()
    email: string

    /**
     * This is the password of the user
     * @example 'Password#123'
     */
    @IsString({ message: 'password must be a string' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,15}$/, {
        message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*), and be between 8 and 15 characters long.',
    })
    @IsOptional()
    password: string


    @IsOptional()
    isAdmin?: boolean
}
