import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { 
  Bell, 
  Clock, 
  AlertTriangle, 
  Trophy, 
  Target, 
  Calendar,
  CheckCircle,
  X,
  ExternalLink
} from 'lucide-react-native';
import { Notification, NotificationType } from '@/types/notification';
import useThemeStore from '@/store/themeStore';
import useNotificationStore from '@/store/notificationStore';

interface NotificationItemProps {
  notification: Notification;
  onPress?: () => void;
}

export default function NotificationItem({ notification, onPress }: NotificationItemProps) {
  const router = useRouter();
  const { colors } = useThemeStore();
  const { markAsRead, deleteNotification } = useNotificationStore();
  
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'due_soon':
        return <Clock size={20} color={colors.warning} />;
      case 'overdue':
        return <AlertTriangle size={20} color={colors.danger} />;
      case 'achievement':
        return <Trophy size={20} color={colors.warning} />;
      case 'streak':
        return <Target size={20} color={colors.success} />;
      case 'recurring':
        return <Calendar size={20} color={colors.primary} />;
      case 'completion':
        return <CheckCircle size={20} color={colors.success} />;
      default:
        return <Bell size={20} color={colors.primary} />;
    }
  };
  
  const getPriorityColor = () => {
    switch (notification.priority) {
      case 'urgent':
        return colors.danger;
      case 'high':
        return colors.warning;
      case 'medium':
        return colors.primary;
      case 'low':
        return colors.textSecondary;
      default:
        return colors.primary;
    }
  };
  
  const handlePress = () => {
    if (!notification.readAt) {
      markAsRead(notification.id);
    }
    
    if (onPress) {
      onPress();
    } else if (notification.actionUrl) {
      router.push(notification.actionUrl);
    } else if (notification.questId) {
      router.push(`/quest/${notification.questId}`);
    }
  };
  
  const handleDelete = () => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteNotification(notification.id)
        },
      ]
    );
  };
  
  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days}d ago`;
    } else if (hours > 0) {
      return `${hours}h ago`;
    } else if (minutes > 0) {
      return `${minutes}m ago`;
    } else {
      return 'Just now';
    }
  };
  
  return (
    <TouchableOpacity 
      style={[
        styles.container,
        { 
          backgroundColor: colors.card,
          borderLeftColor: getPriorityColor(),
        },
        !notification.readAt && { backgroundColor: colors.primary + '10' }
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            {getNotificationIcon(notification.type)}
          </View>
          
          <View style={styles.titleContainer}>
            <Text 
              style={[
                styles.title, 
                { color: colors.text },
                !notification.readAt && { fontWeight: '600' }
              ]}
              numberOfLines={1}
            >
              {notification.title}
            </Text>
            <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
              {formatTime(notification.createdAt)}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={handleDelete}
            hitSlop={10}
          >
            <X size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
        
        <Text 
          style={[
            styles.message, 
            { color: colors.textSecondary },
            !notification.readAt && { color: colors.text }
          ]}
          numberOfLines={2}
        >
          {notification.message}
        </Text>
        
        {(notification.actionUrl || notification.questId) && (
          <View style={styles.actionContainer}>
            <ExternalLink size={14} color={colors.primary} />
            <Text style={[styles.actionText, { color: colors.primary }]}>
              View Details
            </Text>
          </View>
        )}
      </View>
      
      {!notification.readAt && (
        <View style={[styles.unreadIndicator, { backgroundColor: getPriorityColor() }]} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    position: 'relative',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 12,
  },
  deleteButton: {
    padding: 4,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  unreadIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});