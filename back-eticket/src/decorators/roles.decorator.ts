import { SetMetadata } from "@nestjs/common";
import { Role } from "../user/role.enum";

export const Roles = (...roles: Role[])=> SetMetadata('roles', roles)
//asigna en la metada los roles que le pasen al decorador por parentesis