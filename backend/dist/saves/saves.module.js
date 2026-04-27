"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SavesModule = void 0;
const common_1 = require("@nestjs/common");
const saves_controller_1 = require("./saves.controller");
const saves_service_1 = require("./saves.service");
const saves_repository_1 = require("./saves.repository");
const posts_module_1 = require("../posts/posts.module");
let SavesModule = class SavesModule {
};
exports.SavesModule = SavesModule;
exports.SavesModule = SavesModule = __decorate([
    (0, common_1.Module)({
        imports: [posts_module_1.PostsModule],
        controllers: [saves_controller_1.SavesController],
        providers: [saves_service_1.SavesService, saves_repository_1.SavesRepository],
        exports: [saves_service_1.SavesService],
    })
], SavesModule);
//# sourceMappingURL=saves.module.js.map