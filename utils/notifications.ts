import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  data?: any;
  timestamp: Date;
  read: boolean;
  type: 'booking' | 'message' | 'review' | 'general';
}

class NotificationService {
  private expoPushToken: string | null = null;
  private notificationListener: any = null;
  private responseListener: any = null;

  async initialize() {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#3B82F6',
      });
    }

    // Register for push notifications
    await this.registerForPushNotificationsAsync();

    // Set up notification listeners
    this.setupListeners();
  }

  async registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }
      
      token = (await Notifications.getExpoPushTokenAsync({
        projectId: 'b02d7e9e-abcf-44d0-993c-bfb4a13a7ecc'
      })).data;
      
      this.expoPushToken = token;
      
      // Save token to backend
      try {
        await api.post('/users/push-token', { token });
        await AsyncStorage.setItem('expoPushToken', token);
      } catch (error) {
        console.error('Error saving push token:', error);
      }
    }

    return token;
  }

  setupListeners() {
    // Notification received while app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener(
      notification => {
        console.log('Notification received:', notification);
        this.saveNotificationLocally(notification);
      }
    );

    // Notification tapped
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      response => {
        console.log('Notification tapped:', response);
        this.handleNotificationTap(response);
      }
    );
  }

  async saveNotificationLocally(notification: Notifications.Notification) {
    try {
      const notifications = await this.getLocalNotifications();
      const newNotification: AppNotification = {
        id: notification.request.identifier,
        title: notification.request.content.title || 'Notification',
        body: notification.request.content.body || '',
        data: notification.request.content.data,
        timestamp: new Date(),
        read: false,
        type: notification.request.content.data?.type || 'general',
      };
      
      notifications.unshift(newNotification);
      await AsyncStorage.setItem('notifications', JSON.stringify(notifications));
      
      // Update badge count
      await this.updateBadgeCount();
    } catch (error) {
      console.error('Error saving notification:', error);
    }
  }

  async getLocalNotifications(): Promise<AppNotification[]> {
    try {
      const stored = await AsyncStorage.getItem('notifications');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  }

  async markAsRead(notificationId: string) {
    try {
      const notifications = await this.getLocalNotifications();
      const updated = notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      );
      await AsyncStorage.setItem('notifications', JSON.stringify(updated));
      await this.updateBadgeCount();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  async markAllAsRead() {
    try {
      const notifications = await this.getLocalNotifications();
      const updated = notifications.map(n => ({ ...n, read: true }));
      await AsyncStorage.setItem('notifications', JSON.stringify(updated));
      await this.updateBadgeCount();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }

  async deleteNotification(notificationId: string) {
    try {
      const notifications = await this.getLocalNotifications();
      const filtered = notifications.filter(n => n.id !== notificationId);
      await AsyncStorage.setItem('notifications', JSON.stringify(filtered));
      await this.updateBadgeCount();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }

  async clearAll() {
    try {
      await AsyncStorage.setItem('notifications', JSON.stringify([]));
      await Notifications.setBadgeCountAsync(0);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }

  async getUnreadCount(): Promise<number> {
    try {
      const notifications = await this.getLocalNotifications();
      return notifications.filter(n => !n.read).length;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  async updateBadgeCount() {
    try {
      const count = await this.getUnreadCount();
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Error updating badge count:', error);
    }
  }

  handleNotificationTap(response: Notifications.NotificationResponse) {
    const data = response.notification.request.content.data;
    
    // Handle navigation based on notification type
    if (data?.type === 'booking' && data?.bookingId) {
      // Navigate to booking details
      console.log('Navigate to booking:', data.bookingId);
    } else if (data?.type === 'message' && data?.userId) {
      // Navigate to chat
      console.log('Navigate to chat:', data.userId);
    } else if (data?.type === 'review' && data?.serviceId) {
      // Navigate to service
      console.log('Navigate to service:', data.serviceId);
    }
  }

  async scheduleDemoNotification(seconds: number = 5) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Test Notification 🔔",
        body: 'This is a test notification from ServeHub!',
        data: { type: 'general' },
      },
      trigger: { seconds },
    });
  }

  cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }
}

export const notificationService = new NotificationService();