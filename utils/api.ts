import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://serve-hub-green.vercel.app/api';

class ApiClient {
  getBaseURL(): string {
    return API_URL;
  }

  private async getToken(): Promise<string | null> {
    return await AsyncStorage.getItem('token');
  }

  private async getHeaders(includeAuth = true, contentType = 'application/json'): Promise<HeadersInit> {
    const headers: HeadersInit = {};

    // Only add Content-Type for JSON requests
    if (contentType) {
      headers['Content-Type'] = contentType;
    }

    if (includeAuth) {
      const token = await this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  async get(endpoint: string, authenticated = true) {
    const headers = await this.getHeaders(authenticated);
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      headers,
    });
    return this.handleResponse(response);
  }

  async post(endpoint: string, data: any, authenticated = true) {
    const headers = await this.getHeaders(authenticated);
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async put(endpoint: string, data: any) {
    const headers = await this.getHeaders();
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async delete(endpoint: string) {
    const headers = await this.getHeaders();
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers,
    });
    return this.handleResponse(response);
  }

  // Special method for multipart form data (no Content-Type header)
  async uploadFormData(endpoint: string, formData: FormData) {
    const token = await this.getToken();
    const headers: HeadersInit = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });
    return this.handleResponse(response);
  }

  private async handleResponse(response: Response) {
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }
    
    return data;
  }
}

export const api = new ApiClient();