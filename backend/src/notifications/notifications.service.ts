import { Injectable } from '@nestjs/common';
import { NotificationsRepository, Notification } from './notifications.repository';

@Injectable()
export class NotificationsService {
  constructor(private repo: NotificationsRepository) {}

  create(data: Omit<Notification, 'id' | 'isRead' | 'createdAt'>) {
    return this.repo.create(data);
  }

  getForUser(userId: string) {
    return this.repo.findByUser(userId);
  }

  markRead(id: string, userId: string) {
    return this.repo.markRead(id, userId);
  }
}
