import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";

@ValidatorConstraint({ //Me perimete hacer un decorador de validacion
    name: 'MatchingPassword', 
    async: false 
})
export class MatchingPassword implements ValidatorConstraintInterface {

    validate(password: string, argument: ValidationArguments){
        if (password !== (argument.object as any)[argument.constraints[0]]) {
            return false 
        }
        return true
    }

    defaultMessage(argument?: ValidationArguments): string {
        return 'Passwords do not match'
    }
}