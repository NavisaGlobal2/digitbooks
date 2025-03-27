
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type Category = {
  id: string;
  name: string;
  type: 'expense' | 'revenue' | 'both';
  description?: string;
  color?: string;
  icon?: string;
  created_at: string;
  updated_at: string;
};

export const useCategories = () => {
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
      return [];
    }
  };

  const createCategory = async (category: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert(category)
        .select()
        .single();
      
      if (error) throw error;
      toast.success("Category created successfully");
      return data;
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error("Failed to create category");
      return null;
    }
  };

  const updateCategory = async (id: string, category: Partial<Omit<Category, 'id' | 'created_at' | 'updated_at'>>) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update({ ...category, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      toast.success("Category updated successfully");
      return data;
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Failed to update category");
      return null;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success("Category deleted successfully");
      return true;
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
      return false;
    }
  };

  return {
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory
  };
};
