import { SetMetadata } from '@nestjs/common';

export enum Role {
  Creator = 'creator',
  Consumer = 'consumer',
}

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
