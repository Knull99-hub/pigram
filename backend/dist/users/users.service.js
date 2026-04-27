"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const users_repository_1 = require("./users.repository");
const storage_service_1 = require("../storage/storage.service");
let UsersService = class UsersService {
    repo;
    storage;
    constructor(repo, storage) {
        this.repo = repo;
        this.storage = storage;
    }
    create(data) {
        return this.repo.create(data);
    }
    findById(id) { return this.repo.findById(id); }
    findByEmail(email) { return this.repo.findByEmail(email); }
    findByUsername(username) { return this.repo.findByUsername(username); }
    search(q) { return this.repo.search(q); }
    async getProfile(username) {
        const user = await this.repo.findByUsername(username);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return this.sanitize(user);
    }
    async updateProfile(id, dto) {
        const updated = await this.repo.update(id, dto);
        return this.sanitize(updated);
    }
    async updateAvatar(id, file) {
        const url = await this.storage.upload(file.buffer, file.originalname, file.mimetype);
        const updated = await this.repo.update(id, { avatarUrl: url });
        return this.sanitize(updated);
    }
    async incrementCounter(id, field, delta) {
        return this.repo.incrementCounter(id, field, delta);
    }
    sanitize(user) {
        const { passwordHash, email, ...pub } = user;
        return pub;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_repository_1.UsersRepository, storage_service_1.StorageService])
], UsersService);
//# sourceMappingURL=users.service.js.map