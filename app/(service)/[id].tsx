// File: app/(service)/[id].tsx - Updated with Nigerian Naira
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../utils/api';
import { Service } from '../../types';
import { Reviews } from '@/components/Reviews';

export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    fetchService();
  }, [id]);

  const fetchService = async () => {
    try {
      const response = await api.get(`/services/${id}`, false);
      setService(response.data);
    } catch (error) {
      console.error('Error fetching service:', error);
      Alert.alert('Error', 'Failed to load service details');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedDate) {
      Alert.alert('Error', 'Please select a date');
      return;
    }

    setBooking(true);
    try {
      await api.post('/bookings', {
        service: service?._id,
        provider: service?.provider._id,
        date: new Date(selectedDate).toISOString(),
        totalPrice: service?.price,
        notes: bookingNotes,
      });

      setShowBookingModal(false);
      Alert.alert(
        'Success',
        'Booking request sent! The provider will review your request.',
        [{ text: 'OK', onPress: () => router.push('/(tabs)/bookings') }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create booking');
    } finally {
      setBooking(false);
    }
  };

  const handleMessage = () => {
    router.push({
      pathname: '/(tabs)/messages',
      params: { userId: service?.provider._id },
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!service) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Service not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header Image */}
        <View style={styles.imageContainer}>
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>🏠</Text>
          </View>
          <TouchableOpacity
            style={styles.headerBackButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
        </View>

        {/* Service Info */}
        <View style={styles.content}>
          <View style={styles.titleSection}>
            <Text style={styles.category}>{service.category}</Text>
            <Text style={styles.title}>{service.title}</Text>
            <View style={styles.ratingRow}>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={18} color="#F59E0B" />
                <Text style={styles.rating}>{service.rating.toFixed(1)}</Text>
                <Text style={styles.reviews}>({service.reviewCount} reviews)</Text>
              </View>
              <Text style={styles.price}>₦{service.price.toLocaleString()}</Text>
            </View>
          </View>

          {/* Provider Info */}
          <View style={styles.providerSection}>
            <Text style={styles.sectionTitle}>Service Provider</Text>
            <View style={styles.providerCard}>
              <View style={styles.providerAvatar}>
                <Text style={styles.providerAvatarText}>
                  {service.provider.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.providerInfo}>
                <Text style={styles.providerName}>{service.provider.name}</Text>
                <View style={styles.providerRating}>
                  <Ionicons name="star" size={14} color="#F59E0B" />
                  <Text style={styles.providerRatingText}>
                    {service.provider.rating.toFixed(1)} rating
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.messageButton}
                onPress={handleMessage}
              >
                <Ionicons name="chatbubble-outline" size={20} color="#3B82F6" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{service.description}</Text>
          </View>

          {/* Location */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.locationCard}>
              <Ionicons name="location" size={20} color="#3B82F6" />
              <Text style={styles.locationText}>{service.location.address}</Text>
            </View>
          </View>

          {/* Reviews Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reviews & Ratings</Text>
            <Reviews 
              serviceId={service._id} 
              canReview={user?.role === 'client'}
              onReviewAdded={fetchService}
            />
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      {user?.role === 'client' && (
        <View style={styles.bottomBar}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Total Price</Text>
            <Text style={styles.priceValue}>₦{service.price.toLocaleString()}</Text>
          </View>
          <TouchableOpacity
            style={styles.bookButton}
            onPress={() => setShowBookingModal(true)}
          >
            <Text style={styles.bookButtonText}>Book Now</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Booking Modal */}
      <Modal
        visible={showBookingModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowBookingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Book Service</Text>
              <TouchableOpacity onPress={() => setShowBookingModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Select Date</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD (e.g., 2024-12-25)"
                  value={selectedDate}
                  onChangeText={setSelectedDate}
                />
                <Text style={styles.inputHint}>
                  Enter date in YYYY-MM-DD format
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Additional Notes (Optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Any special requirements or notes..."
                  value={bookingNotes}
                  onChangeText={setBookingNotes}
                  multiline
                  numberOfLines={4}
                  maxLength={500}
                />
              </View>

              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Service</Text>
                  <Text style={styles.summaryValue}>{service.title}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Provider</Text>
                  <Text style={styles.summaryValue}>{service.provider.name}</Text>
                </View>
                <View style={[styles.summaryRow, styles.summaryTotal]}>
                  <Text style={styles.summaryTotalLabel}>Total</Text>
                  <Text style={styles.summaryTotalValue}>₦{service.price.toLocaleString()}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.confirmButton, booking && styles.confirmButtonDisabled]}
                onPress={handleBooking}
                disabled={booking}
              >
                {booking ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.confirmButtonText}>Confirm Booking</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    height: 280,
    backgroundColor: '#EFF6FF',
    position: 'relative',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 80,
  },
  headerBackButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  content: {
    padding: 20,
  },
  titleSection: {
    marginBottom: 24,
  },
  category: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 6,
  },
  reviews: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  providerSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  providerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
  },
  providerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  providerAvatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  providerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  providerRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerRatingText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 4,
  },
  messageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 24,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: '#374151',
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
  },
  locationText: {
    fontSize: 15,
    color: '#374151',
    marginLeft: 12,
    flex: 1,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  bookButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  modalBody: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inputHint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 6,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  summaryCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  summaryTotal: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
    marginBottom: 0,
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  summaryTotalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  confirmButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});