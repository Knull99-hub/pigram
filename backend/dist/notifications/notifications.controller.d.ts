import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private notifService;
    constructor(notifService: NotificationsService);
    getAll(user: any): Promise<import("./notifications.repository").Notification[]>;
    markRead(user: any, id: string): Promise<void>;
}
