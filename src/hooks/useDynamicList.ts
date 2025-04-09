
import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Generic type for items in the dynamic list
type Item = {
  id: string;
  [key: string]: any;
};

// Options for the hook
interface UseDynamicListOptions<T extends Item> {
  initialItems: T[];
  onChange: (items: T[]) => void;
  createNewItem: () => Omit<T, 'id'>;
}

export const useDynamicList = <T extends Item>({
  initialItems,
  onChange,
  createNewItem
}: UseDynamicListOptions<T>) => {
  const [items, setItems] = useState<T[]>(initialItems);

  // Add a new item
  const addItem = useCallback(() => {
    const newItem = { ...createNewItem(), id: uuidv4() } as T;
    const newItems = [...items, newItem];
    setItems(newItems);
    onChange(newItems);
  }, [items, createNewItem, onChange]);

  // Remove an item by id
  const removeItem = useCallback((id: string) => {
    // Don't remove the last item
    if (items.length <= 1) return;
    
    const newItems = items.filter(item => item.id !== id);
    setItems(newItems);
    onChange(newItems);
  }, [items, onChange]);

  // Update an item
  const updateItem = useCallback((id: string, updates: Partial<T>) => {
    const newItems = items.map(item => 
      item.id === id ? { ...item, ...updates } : item
    );
    setItems(newItems);
    onChange(newItems);
  }, [items, onChange]);

  return {
    items,
    addItem,
    removeItem,
    updateItem,
    setItems: (newItems: T[]) => {
      setItems(newItems);
      onChange(newItems);
    }
  };
};
