import { api } from '@/lib/api';

export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  unitPrice: number;
  stockQuantity: number;
  reorderLevel: number;
  isActive: boolean;
}

export interface UpsertProductRequest {
  name: string;
  sku: string;
  description: string;
  unitPrice: number;
  stockQuantity: number;
  reorderLevel: number;
  isActive: boolean;
}

export interface AdjustStockRequest {
  productId: string;
  quantity: number;
  reason: string;
}

export const productsService = {
  getAll: () => api.get<Product[]>('/Products'),
  
  //add temporary public access
  getPublic: () => api.get<Product[]>('/Products/public'),
  //end temporary public access

  getById: (id: string) => api.get<Product>(`/Products/${id}`),
  create: (data: UpsertProductRequest) => api.post('/Products', data),
  update: (id: string, data: UpsertProductRequest) => api.put(`/Products/${id}`, data),
  delete: (id: string) => api.delete(`/Products/${id}`),
  adjustStock: (data: AdjustStockRequest) => api.post('/Products/adjust-stock', data),
};
