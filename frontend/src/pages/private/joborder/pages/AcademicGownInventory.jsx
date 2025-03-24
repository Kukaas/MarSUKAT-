import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Eye, Edit2, Trash2, GraduationCap, Ruler, AlertCircle } from "lucide-react";
import { DataTable } from "@/components/custom-components/DataTable";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DeleteConfirmation } from "@/components/custom-components/DeleteConfirmation";
import PrivateLayout from "../../PrivateLayout";
import SectionHeader from "@/components/custom-components/SectionHeader";

import { AcademicGownInventoryForm } from "../forms/AcademicGownInventoryForm";
import { AcademicGownInventoryDetailsDialog } from "../components/details/academic-gown-inventory-details";
import { inventoryAPI } from "../api/inventoryApi";
import StatusBadge from "@/components/custom-components/StatusBadge";

export const AcademicGownInventory = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    level: "",
    productType: "",
    size: "",
    quantity: "",
    status: "Available",
    image: null,
  });
  const [selectedId, setSelectedId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    itemToDelete: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const data = await inventoryAPI.getAllAcademicGownInventory();
      setInventoryItems(data);
    } catch (error) {
      toast.error("Failed to fetch inventory items");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleView = (row) => {
    setSelectedInventory(row);
    setViewDetailsOpen(true);
  };

  const handleEdit = (row) => {
    setFormData({
      level: row.level,
      productType: row.productType,
      size: row.size,
      quantity: row.quantity,
      status: row.status,
      image: row.image || null,
    });
    setSelectedId(row._id);
    setIsEditing(true);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (row) => {
    setDeleteDialog({
      isOpen: true,
      itemToDelete: row,
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      await inventoryAPI.deleteAcademicGownInventory(deleteDialog.itemToDelete._id);
      await fetchInventory();
      toast.success("Inventory item deleted successfully");
      setDeleteDialog({ isOpen: false, itemToDelete: null });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete inventory item");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    if (!isDeleting) {
      setDeleteDialog({ isOpen: false, itemToDelete: null });
    }
  };

  const handleSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      if (isEditing) {
        await inventoryAPI.updateAcademicGownInventory(selectedId, data);
        toast.success("Inventory item updated successfully");
        setEditDialogOpen(false);
      } else {
        await inventoryAPI.createAcademicGownInventory(data);
        toast.success("Inventory item created successfully");
        setCreateDialogOpen(false);
      }
      setIsEditing(false);
      setFormData({
        level: "",
        productType: "",
        size: "",
        quantity: "",
        status: "Available",
        image: null,
      });
      setSelectedId(null);
      fetchInventory();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDialogClose = (type) => {
    if (type === "edit") {
      setEditDialogOpen(false);
      setIsEditing(false);
      setSelectedId(null);
    } else if (type === "create") {
      setCreateDialogOpen(false);
    }
    setFormData({
      level: "",
      productType: "",
      size: "",
      quantity: "",
      status: "Available",
      image: null,
    });
  };

  const onCreateNew = () => {
    setFormData({
      level: "",
      productType: "",
      size: "",
      quantity: "",
      status: "Available",
      image: null,
    });
    setCreateDialogOpen(true);
  };

  const columns = [
    {
      key: "inventoryId",
      header: "Inventory ID",
      render: (value) => (
        <div className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-gray-500" />
          <span className="font-medium text-primary">{value}</span>
        </div>
      ),
    },
    {
      key: "level",
      header: "Level",
      render: (value) => (
        <div className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: "productType",
      header: "Product Type",
      render: (value) => (
        <div className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: "size",
      header: "Size",
      render: (value) => (
        <div className="flex items-center gap-2">
          <Ruler className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: "quantity",
      header: "Quantity",
      render: (value) => (
        <div className="flex items-center gap-2">
          <Ruler className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (value) => <StatusBadge status={value} icon={AlertCircle} />,
    },
  ];

  const actionCategories = {
    view: {
      label: "View Actions",
      actions: [
        {
          label: "View Details",
          icon: Eye,
          onClick: handleView,
        },
      ],
    },
    edit: {
      label: "Edit Actions",
      actions: [
        {
          label: "Edit",
          icon: Edit2,
          onClick: handleEdit,
        },
      ],
    },
    delete: {
      label: "Delete Actions",
      actions: [
        {
          label: "Delete",
          icon: Trash2,
          onClick: handleDeleteClick,
          variant: "destructive",
        },
      ],
    },
  };

  return (
    <PrivateLayout>
      <div className="space-y-6">
        <SectionHeader
          title="Academic Gown Inventory Management"
          description="Manage academic gown inventory in the system"
        />

        <DataTable
          data={inventoryItems}
          columns={columns}
          isLoading={loading}
          actionCategories={actionCategories}
          onCreateNew={onCreateNew}
          createButtonText={
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Add Gown Item</span>
            </div>
          }
        />

        {/* View Dialog */}
        <AcademicGownInventoryDetailsDialog
          isOpen={viewDetailsOpen}
          onClose={() => setViewDetailsOpen(false)}
          item={selectedInventory}
        />

        {/* Create Dialog */}
        <AlertDialog open={createDialogOpen}>
          <AlertDialogContent className="sm:max-w-[600px]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-semibold">
                Create New Gown Item
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-500">
                Add a new item to the academic gown inventory
              </AlertDialogDescription>
            </AlertDialogHeader>
            <ScrollArea className="h-[400px] pr-4">
              <div className="py-2">
                <AcademicGownInventoryForm
                  formData={formData}
                  setFormData={setFormData}
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                />
              </div>
            </ScrollArea>
            <AlertDialogFooter className="pt-4">
              <AlertDialogCancel
                type="button"
                onClick={() => !isSubmitting && handleDialogClose("create")}
                disabled={isSubmitting}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                type="submit"
                form="academicGownInventoryForm"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="loading loading-spinner loading-sm mr-2"></span>
                    Creating...
                  </>
                ) : (
                  "Create"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Edit Dialog */}
        <AlertDialog open={editDialogOpen}>
          <AlertDialogContent className="sm:max-w-[600px]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-semibold">
                Edit Gown Item
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-500">
                Modify the academic gown item details
              </AlertDialogDescription>
            </AlertDialogHeader>
            <ScrollArea className="h-[400px] pr-4">
              <div className="py-2">
                <AcademicGownInventoryForm
                  formData={formData}
                  setFormData={setFormData}
                  isEdit={true}
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                />
              </div>
            </ScrollArea>
            <AlertDialogFooter className="pt-4">
              <AlertDialogCancel
                type="button"
                onClick={() => !isSubmitting && handleDialogClose("edit")}
                disabled={isSubmitting}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                type="submit"
                form="academicGownInventoryForm"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="loading loading-spinner loading-sm mr-2"></span>
                    Updating...
                  </>
                ) : (
                  "Update"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmation
          isOpen={deleteDialog.isOpen}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          title="Delete Gown Item"
          description={
            deleteDialog.itemToDelete
              ? `Are you sure you want to delete the gown item "${deleteDialog.itemToDelete.productType} (${deleteDialog.itemToDelete.size})"? This action cannot be undone.`
              : "Are you sure you want to delete this gown item? This action cannot be undone."
          }
          isDeleting={isDeleting}
        />
      </div>
    </PrivateLayout>
  );
}
