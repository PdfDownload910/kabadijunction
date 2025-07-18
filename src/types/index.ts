export interface ScrapMaterial {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  image: string;
  description?: string;
  minQuantity: number;
}

export interface Order {
  id: string;
  userId?: string;
  customerName: string;
  phone: string;
  address: string;
  landmark: string;
  ward: number;
  pickupDate: string;
  pickupTime: string;
  scrapMaterials: { materialId: string; quantity: number; price: number }[];
  totalAmount: number;
  paymentMethod: string;
  paymentDetails?: {
    upiId?: string;
    bankAccount?: string;
  };
  status: 'pending' | 'confirmed' | 'picked' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  address?: string;
  createdAt: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  requiresDetails: boolean;
  detailsType?: 'upi' | 'bank';
}