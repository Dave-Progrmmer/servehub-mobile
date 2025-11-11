import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { notificationService, AppNotification } from '../utils/notifications';

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [])
  );

  const loadNotifications = async () => {
    try {
      const data = await notificationService.getLocalNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  const handleNotificationPress = async (notification: AppNotification) => {
    // Mark as read
    await notificationService.markAsRead(notification.id);
    loadNotifications();

    // Navigate based on type
    if (notification.data?.bookingId) {
      router.push(`/(tabs)/bookings`);
    } else if (notification.data?.userId) {
      router.push(`/chat/${notification.data.userId}` as any);
    } else if (notification.data?.serviceId) {
      router.push(`/(service)/${notification.data.serviceId}` as any);
    }
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead();
    loadNotifications();
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to delete all notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await notificationService.clearAll();
            loadNotifications();
          },
        },
      ]
    );
  };

  const handleDelete = (notificationId: string) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await notificationService.deleteNotification(notificationId);
            loadNotifications();
          },
        },
      ]
    );
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return 'calendar';
      case 'message':
        return 'chatbubble';
      case 'review':
        return 'star';
      default:
        return 'notifications';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'booking':
        return '#3B82F6';
      case 'message':
        return '#10B981';
      case 'review':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const renderNotification = ({ item }: { item: AppNotification }) => (
    <TouchableOpacity
      style={[styles.notificationCard, !item.read && styles.unreadCard]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.notificationContent}>
        <View style={[styles.iconContainer, { backgroundColor: getIconColor(item.type) + '20' }]}>
          <Ionicons name={getIcon(item.type) as any} size={24} color={getIconColor(item.type)} />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={[styles.title, !item.read && styles.unreadText]}>
            {item.title}
          </Text>
          <Text style={styles.body} numberOfLines={2}>
            {item.body}
          </Text>
          <Text style={styles.time}>{formatTime(item.timestamp)}</Text>
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item.id)}
        >
          <Ionicons name="close" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
      
      {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={{ width: 40 }} />
        </View>

        {notifications.length > 0 && (
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleMarkAllRead} style={styles.actionButton}>
              <Text style={styles.actionText}>Mark all read</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleClearAll} style={styles.actionButton}>
              <Text style={[styles.actionText, styles.clearText]}>Clear all</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>No notifications</Text>
          <Text style={styles.emptyText}>
            You're all caught up! Notifications will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    paddingVertical: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  clearText: {
    color: '#EF4444',
  },
  listContent: {
    padding: 16,
  },
  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: 'relative',
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  unreadText: {
    fontWeight: 'bold',
  },
  body: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 6,
    lineHeight: 20,
  },
  time: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  deleteButton: {
    padding: 4,
  },
  unreadDot: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});