/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useCallback } from "react";
import { Plus, Edit2, Trash2, Search } from "lucide-react";
import toast from "react-hot-toast";
import { useDebounce } from "@/hooks/useDebounce";
import TableSkeleton from "@/components/ui/dashboard/TableSkeleton";
import EmptyTableUi from "@/components/ui/dashboard/EmptyTable";
import Pagination from "@/components/ui/dashboard/Pagination";
import Button from "@/components/ui/Button";
import PageHeader from "../PageHeader";
import { categoryService } from "@/services/categories.service";
import DialogPopup from "@/components/ui/DialogPopup";
import DeleteConfirmationDialog from "@/components/ui/dashboard/ConfirmationPopup";

interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  name: string;
  description: string;
}

const CategoryPage: React.FC = () => {
  const [state, setState] = useState({
    categories: [] as Category[],
    searchTerm: "",
    currentPage: 1,
    itemsPerPage: 20,
    totalPages: 1,
    totalItems: 0,
    loading: false,
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    categories,
    searchTerm,
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems,
    loading,
  } = state;

  const loadCategories = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));
    try {
      const result = await categoryService.getAllCategories({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
      });

      if (result?.success) {
        setState((prev) => ({
          ...prev,
          categories: result.data || [],
          totalPages: result.pagination.totalPages,
          totalItems: result.pagination.total,
          loading: false,
        }));
      }
    } catch (err: any) {
      console.error("Load categories error:", err);
      toast.error(err.message || "Failed to fetch categories");
      setState((prev) => ({ ...prev, categories: [], loading: false }));
    }
  }, [currentPage, itemsPerPage, searchTerm]);

  useDebounce(loadCategories, 400, [searchTerm, currentPage, itemsPerPage]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState((prev) => ({
      ...prev,
      searchTerm: e.target.value,
      currentPage: 1,
    }));
  };

  const openDialog = (category?: Category) => {
    if (category) {
      setEditingId(category.id);
      setFormData({
        name: category.name,
        description: category.description || "",
      });
    } else {
      setEditingId(null);
      setFormData({ name: "", description: "" });
    }
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingId(null);
    setFormData({ name: "", description: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      let result;
      if (editingId) {
        result = await categoryService.updateCategory(editingId, formData);
        toast.success(result.message || "Category updated successfully");
      } else {
        result = await categoryService.createCategory(formData);
        toast.success(result.message || "Category created successfully");
      }

      closeDialog();
      loadCategories();
    } catch (err: any) {
      console.error("Submit error:", err);
      toast.error(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteCategoryId(id); // open dialog
  };

  const confirmDelete = async () => {
    if (!deleteCategoryId) return;

    setDeleteLoading(true);

    try {
      const result = await categoryService.deleteCategory(deleteCategoryId);
      toast.success(result.message || "Category deleted successfully");
      loadCategories();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete category");
    } finally {
      setDeleteLoading(false);
      setDeleteCategoryId(null); // close dialog
    }
  };

  return (
    <div className="bg-dark-100 min-h-screen">
      <div className="mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <PageHeader heading="Categories" describe="Manage brand categories" />
          <Button
            onClick={() => openDialog()}
            className="flex items-center gap-2 text-white"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </Button>

          <DialogPopup
            open={isDialogOpen}
            setShowCreateModal={setIsDialogOpen}
            heading={editingId ? "Edit Category" : "Add Category"}
            className="bg-dark-100 border border-[#334155]  shadow-lg"
            mode="dark"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#BDBDBD] mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter category name"
                  className="w-full px-4 py-2 bg-dark-200 border border-[#334155]  
        text-[#f1f5f9] placeholder:text-[#94a3b8] focus:outline-none 
        focus:border-blue-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#BDBDBD] mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Enter category description (optional)"
                  rows={4}
                  className="w-full px-4 py-2 bg-dark-200 border border-[#334155] 
         text-[#f1f5f9] placeholder:text-[#94a3b8] focus:outline-none 
        focus:border-blue-500 transition resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeDialog}
                  className="flex-1 px-4 py-2 bg-dark-200 border border-[#334155] 
         text-[#f1f5f9] hover:bg-dark-200/80 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white  
        hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </DialogPopup>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 bg-dark-200 border border-[#334155]  text-[#f1f5f9] placeholder:text-[#94a3b8] focus:outline-none focus:border-blue-500 transition"
            />
          </div>
        </div>

        {loading && <TableSkeleton />}

        {!loading && (
          <div className="bg-dark-100 border border-[#334155]  overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-5/10 border-b border-[#334155]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#BDBDBD] uppercase">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#BDBDBD] uppercase">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#BDBDBD] uppercase">
                      Created At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#BDBDBD] uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-5/20">
                  {categories.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6">
                        <EmptyTableUi
                          heading="No categories found"
                          description="Create your first category to get started."
                        />
                      </td>
                    </tr>
                  ) : (
                    categories.map((category) => (
                      <tr
                        key={category.id}
                        className="hover:bg-[#334155] transition border-b border-[#334155]"
                      >
                        <td className="px-6 py-4 text-[#f1f5f9] font-sofia-sans">
                          {category.name}
                        </td>
                        <td className="px-6 py-4 text-[#94a3b8] font-sofia-sans">
                          {category.description || "-"}
                        </td>
                        <td className="px-6 py-4 text-[#94a3b8] font-sofia-sans text-sm">
                          {new Date(category.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-[#f1f5f9] font-sofia-sans">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openDialog(category)}
                              className="p-2 hover:bg-blue-500/10 rounded transition"
                              title="Edit category"
                            >
                              <Edit2 className="w-4 h-4 text-blue-400" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(category.id)}
                              className="p-2 hover:bg-red-500/10 rounded transition"
                              title="Delete category"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <DeleteConfirmationDialog
              deleteBrandId={deleteCategoryId ? 1 : null} 
              mode="dark"
              setDeleteBrandId={() => setDeleteCategoryId(null)}
              confirmDelete={confirmDelete}
              deleteLoading={deleteLoading}
              heading="Delete Category"
              content="Are you sure you want to delete this category ? "
              actionLabel="Delete"
            />
            {categories.length > 0 && (
              <Pagination
                currentPage={currentPage}
                hasNext={currentPage < totalPages}
                hasPrev={currentPage > 1}
                itemsPerPage={itemsPerPage}
                setCurrentPage={(page) =>
                  setState((prev) => ({ ...prev, currentPage: page }))
                }
                totalItems={totalItems}
                totalPages={totalPages}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
