import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';
export declare class AuthController {
    private authService;
    private usersService;
    constructor(authService: AuthService, usersService: UsersService);
    register(dto: RegisterDto): Promise<{
        token: string;
        user: import("../users/user.entity").PublicUser;
    }>;
    login(dto: LoginDto): Promise<{
        token: string;
        user: import("../users/user.entity").PublicUser;
    }>;
    me(user: any): import("../users/user.entity").PublicUser;
}
