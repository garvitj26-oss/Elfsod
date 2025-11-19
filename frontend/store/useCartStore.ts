import { create } from 'zustand';
import { CartItem, AdSpace } from '@/types';

interface CartStore {
  items: CartItem[];
  addItem: (adSpace: AdSpace, startDate: string, endDate: string, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<CartItem>) => void;
  clearCart: () => void;
  markItemsAsPending: (quoteRequestId: string) => void;
  markItemsAsApproved: (quoteRequestId: string) => void;
  markItemsAsRejected: (quoteRequestId: string) => void;
  getTotal: () => number;
  getItemCount: () => number;
  getPendingCount: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  
  addItem: (adSpace, startDate, endDate, quantity = 1) => {
    const days = Math.ceil(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    const subtotal = adSpace.price_per_day * days * quantity;
    
    const newItem: CartItem = {
      id: `temp-${Date.now()}`,
      user_id: '',
      ad_space_id: adSpace.id,
      ad_space: adSpace,
      start_date: startDate,
      end_date: endDate,
      quantity,
      subtotal,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    set((state) => ({
      items: [...state.items, newItem],
    }));
  },
  
  removeItem: (id) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }));
  },
  
  updateItem: (id, updates) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id
          ? {
              ...item,
              ...updates,
              updated_at: new Date().toISOString(),
            }
          : item
      ),
    }));
  },
  
  clearCart: () => {
    set({ items: [] });
  },
  
  markItemsAsPending: (quoteRequestId: string) => {
    set((state) => ({
      items: state.items.map((item) => ({
        ...item,
        approval_status: 'pending' as const,
        quote_request_id: quoteRequestId,
        updated_at: new Date().toISOString(),
      })),
    }));
  },
  
  markItemsAsApproved: (quoteRequestId: string) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.quote_request_id === quoteRequestId
          ? {
              ...item,
              approval_status: 'approved' as const,
              updated_at: new Date().toISOString(),
            }
          : item
      ),
    }));
  },
  
  markItemsAsRejected: (quoteRequestId: string) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.quote_request_id === quoteRequestId
          ? {
              ...item,
              approval_status: 'rejected' as const,
              updated_at: new Date().toISOString(),
            }
          : item
      ),
    }));
  },
  
  getTotal: () => {
    return get().items.reduce((sum, item) => sum + item.subtotal, 0);
  },
  
  getItemCount: () => {
    return get().items.length;
  },
  
  getPendingCount: () => {
    return get().items.filter((item) => item.approval_status === 'pending').length;
  },
}));

