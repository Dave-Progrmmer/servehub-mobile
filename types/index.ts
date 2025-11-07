export interface Service {
    _id: string;
    title: string;
    description: string;
    category: string;
    price: number;
    photos: string[];
    location: {
      address: string;
      lat: number;
      lng: number;
    };
    rating: number;
    reviewCount: number;
    provider: {
      _id: string;
      name: string;
      email: string;
      rating: number;
      profilePic?: string;
      phone?: string;
    };
  }
  
  export interface Booking {
    _id: string;
    client: {
      _id: string;
      name: string;
      email: string;
      phone?: string;
      profilePic?: string;
    };
    provider: {
      _id: string;
      name: string;
      email: string;
      phone?: string;
      profilePic?: string;
    };
    service: {
      _id: string;
      title: string;
      price: number;
      category: string;
      photos: string[];
    };
    date: string;
    status: 'pending' | 'accepted' | 'completed' | 'cancelled';
    totalPrice: number;
    notes?: string;
    createdAt: string;
  }
  
  export interface Message {
    _id: string;
    sender: {
      _id: string;
      name: string;
      email: string;
    };
    receiver: {
      _id: string;
      name: string;
      email: string;
    };
    content: string;
    read: boolean;
    createdAt: string;
  }
  