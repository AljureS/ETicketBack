import { ApiHideProperty } from "@nestjs/swagger"
import { IsEmail, IsEmpty, IsNotEmpty, IsNumber, IsString, Length, Matches, Validate } from "class-validator"
import { MatchingPassword } from "src/decorators/matchingPassword.decorator"

export class createUserDto { 
    /**
    This is the name of the user 
    @example 'Cristiano'
     */
    @IsNotEmpty({message: 'Name required'})
    @Length(3, 80, { message: 'El nombre debe tener entre 3 y 80 caracteres.' })
    @IsString({ message: 'name must be a string' })
    name: string
    
    /**
    This is the name of the user 
    @example 'Cristiano'
     */
    @IsNotEmpty({message: 'Name required'})
    @Length(3, 80, { message: 'El nombre debe tener entre 3 y 80 caracteres.' })
    @IsString({ message: 'name must be a string' })
    lastName: string

    /**
     * This is the phone of the user
     * @example '123456789'
     */
    @IsString()
    @IsNotEmpty({message: 'Phone required'})
    phone: string 

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

    /**
     * This is the confirm password of the user
     * @example 'Password#123'
     */
    @IsNotEmpty({ message: 'Confirm password required' })
    @Validate(MatchingPassword, ['password'])
    confirmPassword: string

    @ApiHideProperty()
    @IsEmpty()
    isAdmin?: boolean
    
    @ApiHideProperty()
    @IsEmpty()
    isPremium?: boolean
}
