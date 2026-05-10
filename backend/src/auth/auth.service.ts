import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService, private jwt: JwtService) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already in use');

    const usernameExists = await this.usersService.findByUsername(dto.username);
    if (usernameExists) throw new ConflictException('Username already taken');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = dto;
    const user = await this.usersService.create({ ...rest, role: 'consumer', passwordHash, avatarUrl: '', bio: '', website: '', location: '' });
    const token = this.jwt.sign({ sub: user.id, email: user.email });
    return { token, user: this.usersService.sanitize(user) };
  }

  async createCreator(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already in use');
    const usernameExists = await this.usersService.findByUsername(dto.username);
    if (usernameExists) throw new ConflictException('Username already taken');
    const passwordHash = await bcrypt.hash(dto.password, 12);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = dto;
    const user = await this.usersService.create({ ...rest, role: 'creator', passwordHash, avatarUrl: '', bio: '', website: '', location: '' });
    const token = this.jwt.sign({ sub: user.id, email: user.email });
    return { token, user: this.usersService.sanitize(user) };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const token = this.jwt.sign({ sub: user.id, email: user.email });
    return { token, user: this.usersService.sanitize(user) };
  }
}
