import { useAuth } from "@/context/AuthContext";
import PrivateLayout from "../../PrivateLayout";
import { DataTable } from "@/components/custom-components/DataTable";
import { Button } from "@/components/ui/button";
import { Coins, Plus, Eye, Edit2, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { systemMaintenanceAPI } from "@/lib/systemMaintenance";
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
import { toast } from "sonner";
import { PriceDetailsDialog } from "../components/details/price-details";
import { PriceForm } from "../forms/PriceForm";
import SectionHeader from "@/components/custom-components/SectionHeader";
import { DeleteConfirmation } from "@/components/custom-components/DeleteConfirmation";

export default function Prices() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [prices, setPrices] = useState([]);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    price: "",
  });
  const [selectedId, setSelectedId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    priceToDelete: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch prices data
  const fetchPrices = async () => {
    try {
      setIsLoading(true);
      const data = await systemMaintenanceAPI.getAllPrices();
      setPrices(data);
    } catch (error) {
      toast.error("Failed to fetch prices");
      console.error("Error fetching prices:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, []);

  // Column definitions
  const columns = [
    {
      key: "priceId",
      header: "Price ID",
      render: (value) => (
        <div className="flex items-center gap-2">
          <Coins className="h-4 w-4 text-gray-500" />
          <span className="font-medium text-primary">{value}</span>
        </div>
      ),
    },
    {
      key: "price",
      header: "Price",
      render: (value) => (
        <div className="flex items-center gap-2">
          <Coins className="h-4 w-4 text-gray-500" />
          <span className="font-medium">₱{value.toFixed(2)}</span>
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "Created At",
      render: (value) => (
        <span>
          {new Date(value).toLocaleDateString("en-US", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      ),
    },
  ];

  // Action handlers
  const handleView = (row) => {
    setSelectedPrice(row);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (row) => {
    setFormData({
      price: row.price,
      priceId: row.priceId,
    });
    setSelectedId(row._id);
    setIsEditing(true);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (row) => {
    setDeleteDialog({
      isOpen: true,
      priceToDelete: row,
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      await systemMaintenanceAPI.deletePrice(deleteDialog.priceToDelete._id);
      await fetchPrices();
      toast.success("Price deleted successfully");
      setDeleteDialog({ isOpen: false, priceToDelete: null });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete price");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    if (!isDeleting) {
      setDeleteDialog({ isOpen: false, priceToDelete: null });
    }
  };

  const handleSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      if (isEditing) {
        await systemMaintenanceAPI.updatePrice(selectedId, data);
        toast.success("Price updated successfully");
        setIsEditDialogOpen(false);
      } else {
        await systemMaintenanceAPI.createPrice(data);
        toast.success("Price created successfully");
        setIsCreateDialogOpen(false);
      }
      setIsEditing(false);
      setFormData({ price: "" });
      setSelectedId(null);
      fetchPrices();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clean up function for dialog close
  const handleDialogClose = (type) => {
    if (type === "edit") {
      setIsEditDialogOpen(false);
      setIsEditing(false);
      setSelectedId(null);
    } else if (type === "create") {
      setIsCreateDialogOpen(false);
    }
    setFormData({ price: "" });
  };

  // Define actions for the prices
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
          title="Price Management"
          description="Manage prices in the system"
        />

        <DataTable
          data={prices}
          columns={columns}
          isLoading={isLoading}
          actionCategories={actionCategories}
          onCreateNew={() => {
            setFormData({ price: "" });
            setIsCreateDialogOpen(true);
          }}
          createButtonText={
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Create Price</span>
            </div>
          }
        />

        {/* View Dialog */}
        <PriceDetailsDialog
          isOpen={isViewDialogOpen}
          onClose={() => setIsViewDialogOpen(false)}
          price={selectedPrice}
        />

        {/* Create Dialog */}
        <AlertDialog open={isCreateDialogOpen}>
          <AlertDialogContent className="sm:max-w-[600px]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-semibold">
                Create New Price
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-500">
                Add a new price to the system
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-2">
              <PriceForm
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
              />
            </div>
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
                form="priceForm"
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
        <AlertDialog open={isEditDialogOpen}>
          <AlertDialogContent className="sm:max-w-[600px]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-semibold">
                Edit Price
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-500">
                Modify the price details
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-2">
              <PriceForm
                formData={formData}
                setFormData={setFormData}
                isEdit={true}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
              />
            </div>
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
                form="priceForm"
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
          title="Delete Price"
          description={
            deleteDialog.priceToDelete
              ? `Are you sure you want to delete the price "₱${deleteDialog.priceToDelete.price.toFixed(
                  2
                )}"? This action cannot be undone.`
              : "Are you sure you want to delete this price? This action cannot be undone."
          }
          isDeleting={isDeleting}
        />
      </div>
    </PrivateLayout>
  );
}
