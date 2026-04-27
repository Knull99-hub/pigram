import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private usersService;
    private jwt;
    constructor(usersService: UsersService, jwt: JwtService);
    register(dto: RegisterDto): Promise<{
        token: string;
        user: import("../users/user.entity").PublicUser;
    }>;
    login(dto: LoginDto): Promise<{
        token: string;
        user: import("../users/user.entity").PublicUser;
    }>;
}
