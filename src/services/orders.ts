import { api } from '@/lib/api';

export interface OrderLineDto {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  orderedAtUtc: string;
  isCanceled: boolean;
  lines: OrderLineDto[];
  totalAmount: number;
}

export interface CreateOrderLineRequest {
  productId: string;
  quantity: number;
}

export interface CreateOrderRequest {
  customerId: string;
  lines: CreateOrderLineRequest[];
}

export const ordersService = {
  getAll: (limit: number = 25) => api.get<Order[]>(`/Orders?limit=${limit}`),
  getById: (id: string) => api.get<Order>(`/Orders/${id}`),
  create: (data: CreateOrderRequest) => api.post<Order>('/Orders', data),
  cancel: (id: string) => api.post(`/Orders/${id}/cancel`, {}),
};
