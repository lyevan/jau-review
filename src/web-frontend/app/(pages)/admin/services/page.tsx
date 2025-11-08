"use client";

import { useState } from "react";
import { useGetConsultationServices } from "@/app/_hooks/queries/useServices";
import {
  useCreateConsultationService,
  useUpdateConsultationService,
  useDeleteConsultationService,
} from "@/app/_hooks/mutations/useServices";
import { toast } from "@/app/_utils/toast";
import { ConsultationService } from "@/app/_services/service.service";

export default function ServicesManagementPage() {
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] =
    useState<ConsultationService | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    isActive: true,
  });

  const { data: services, isLoading } = useGetConsultationServices();
  const createService = useCreateConsultationService();
  const updateService = useUpdateConsultationService();
  const deleteService = useDeleteConsultationService();

  const handleOpenModal = (service?: ConsultationService) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        description: service.description || "",
        price: parseFloat(service.price).toString(),
        isActive: service.isActive,
      });
    } else {
      setEditingService(null);
      setFormData({
        name: "",
        description: "",
        price: "",
        isActive: true,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingService(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      isActive: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price) {
      toast.error("Validation Error", "Name and price are required");
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      toast.error("Validation Error", "Price must be a positive number");
      return;
    }

    try {
      if (editingService) {
        // Update existing service
        await updateService.mutateAsync({
          id: editingService.id,
          data: {
            name: formData.name,
            description: formData.description || undefined,
            price,
            isActive: formData.isActive,
          },
        });
        toast.success("Service Updated", `${formData.name} has been updated`);
      } else {
        // Create new service
        await createService.mutateAsync({
          name: formData.name,
          description: formData.description || undefined,
          price,
          isActive: formData.isActive,
        });
        toast.success("Service Created", `${formData.name} has been created`);
      }
      handleCloseModal();
    } catch (error: any) {
      toast.error(
        "Operation Failed",
        error.message || "Failed to save service"
      );
    }
  };

  const handleDelete = async (service: ConsultationService) => {
    if (
      !confirm(
        `Are you sure you want to deactivate "${service.name}"? This will make it unavailable for new consultations.`
      )
    ) {
      return;
    }

    try {
      await deleteService.mutateAsync(service.id);
      toast.success(
        "Service Deactivated",
        `${service.name} has been deactivated`
      );
    } catch (error: any) {
      toast.error(
        "Deactivation Failed",
        error.message || "Failed to deactivate service"
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-teal-700">
              Consultation Services
            </h1>
            <p className="text-gray-600 mt-1">
              Manage consultation services and pricing
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
          >
            + Add New Service
          </button>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services && services.length > 0 ? (
            services.map((service) => (
              <div
                key={service.id}
                className={`bg-white rounded-xl shadow-sm p-6 border-2 ${
                  service.isActive
                    ? "border-teal-200"
                    : "border-gray-200 opacity-60"
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {service.name}
                    </h3>
                    {service.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {service.description}
                      </p>
                    )}
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      service.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {service.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-3xl font-bold text-teal-600">
                    ₱{parseFloat(service.price).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Created: {new Date(service.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenModal(service)}
                    className="flex-1 px-4 py-2 border border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50 transition-colors text-sm font-medium"
                  >
                    Edit
                  </button>
                  {service.isActive && (
                    <button
                      onClick={() => handleDelete(service)}
                      className="flex-1 px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                    >
                      Deactivate
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-white rounded-xl shadow-sm p-12">
              <div className="text-center">
                <div className="mx-auto h-16 w-16 text-6xl text-gray-400">
                  🏥
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  No Services Yet
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Get started by creating your first consultation service
                </p>
                <button
                  onClick={() => handleOpenModal()}
                  className="mt-6 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
                >
                  Create Service
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingService ? "Edit Service" : "Create New Service"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                {/* Service Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="e.g., General Consultation"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Brief description of the service"
                    rows={3}
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (₱) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="500.00"
                    required
                  />
                </div>

                {/* Active Status */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="isActive"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Service is active and available
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createService.isPending || updateService.isPending}
                  className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium disabled:opacity-50"
                >
                  {createService.isPending || updateService.isPending
                    ? "Saving..."
                    : editingService
                      ? "Update Service"
                      : "Create Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
