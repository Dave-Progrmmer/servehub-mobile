import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { api } from '../../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CATEGORIES = [
  'Cleaning',
  'Plumbing',
  'Electrical',
  'Gardening',
  'Painting',
  'Carpentry',
  'Tutoring',
  'Photography',
];

export default function CreateServiceScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Cleaning',
    price: '',
    location: '',
  });

  const pickImages = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow access to your photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.5,
      });

      if (!result.canceled && result.assets[0]) {
        setPhotos([...photos, result.assets[0].uri]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    // Validate
    if (!formData.title || !formData.description || !formData.price) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (photos.length === 0) {
      Alert.alert('Error', 'Please add at least one photo');
      return;
    }

    setLoading(true);
    try {
      // Create form data
      const formDataToSend = new FormData();
      
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('price', formData.price);
      
      if (formData.location) {
        formDataToSend.append('location', JSON.stringify({
          address: formData.location,
        }));
      }

      // Add photos
      photos.forEach((photo, index) => {
        const fileExtension = photo.split('.').pop();
        const fileName = `service_${Date.now()}_${index}.${fileExtension}`;
        
        formDataToSend.append('photos', {
          uri: photo,
          name: fileName,
          type: `image/${fileExtension}`,
        } as any);
      });

      // Upload
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${api.getBaseURL()}/services`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create service');
      }

      Alert.alert('Success', 'Service created successfully', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      console.error('Create service error:', error);
      Alert.alert('Error', error.message || 'Failed to create service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'android' ? 'height' : 'padding'}
      keyboardVerticalOffset={Platform.OS === 'android' ? 10 : 0}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.title}>Create Service</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            {/* Photos */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Photos *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {photos.map((photo, index) => (
                  <View key={index} style={styles.photoContainer}>
                    <Image source={{ uri: photo }} style={styles.photo} />
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removePhoto(index)}
                    >
                      <Ionicons name="close" size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                ))}
                {photos.length < 5 && (
                  <TouchableOpacity
                    style={styles.addPhotoButton}
                    onPress={pickImages}
                  >
                    <Ionicons name="camera" size={32} color="#6B7280" />
                    <Text style={styles.addPhotoText}>Add Photo</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            </View>

            {/* Title */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Professional House Cleaning"
                value={formData.title}
                onChangeText={(text) =>
                  setFormData({ ...formData, title: text })
                }
              />
            </View>

            {/* Description */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe your service..."
                value={formData.description}
                onChangeText={(text) =>
                  setFormData({ ...formData, description: text })
                }
                multiline
                numberOfLines={4}
              />
            </View>

            {/* Category */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Category *</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryScroll}
              >
                {CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryChip,
                      formData.category === category &&
                        styles.categoryChipActive,
                    ]}
                    onPress={() =>
                      setFormData({ ...formData, category })
                    }
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        formData.category === category &&
                          styles.categoryTextActive,
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Price */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Price *</Text>
              <View style={styles.priceInput}>
                <Text style={styles.priceSymbol}>₦</Text>
                <TextInput
                  style={styles.priceField}
                  placeholder="0.00"
                  value={formData.price}
                  onChangeText={(text) =>
                    setFormData({ ...formData, price: text })
                  }
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            {/* Location */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Location</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your location"
                value={formData.location}
                onChangeText={(text) =>
                  setFormData({ ...formData, location: text })
                }
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'Creating...' : 'Create Service'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 20,
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  photoContainer: {
    position: 'relative',
    marginRight: 12,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#EF4444',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoButton: {
    width: 120,
    height: 120,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  addPhotoText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  categoryScroll: {
    marginLeft: -4,
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginLeft: 8,
  },
  categoryChipActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  priceInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingLeft: 16,
  },
  priceSymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginRight: 4,
  },
  priceField: {
    flex: 1,
    padding: 16,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});