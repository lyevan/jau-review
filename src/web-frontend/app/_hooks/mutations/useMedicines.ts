import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  MedicineService,
  CreateMedicineData,
  UpdateMedicineData,
  StockInData,
  StockOutData,
} from "@/app/_services/medicine.service";
import { toast } from "@/app/_utils/toast";

const medicineService = new MedicineService();

export const useCreateMedicine = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async (data: CreateMedicineData) => {
      const response = await medicineService.createMedicine(
        session!.user.access_token,
        data
      );
      return response.result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      toast.success("Success", "Medicine added successfully");
    },
    onError: (error: any) => {
      toast.error(
        "Error",
        error?.response?.data?.error || "Failed to add medicine"
      );
    },
  });
};

export const useUpdateMedicine = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: UpdateMedicineData;
    }) => {
      const response = await medicineService.updateMedicine(
        session!.user.access_token,
        id,
        data
      );
      return response.result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      toast.success("Success", "Medicine updated successfully");
    },
    onError: (error: any) => {
      toast.error(
        "Error",
        error?.response?.data?.error || "Failed to update medicine"
      );
    },
  });
};

export const useAdjustStock = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async ({
      id,
      adjustment,
      reason,
    }: {
      id: number;
      adjustment: number;
      reason?: string;
    }) => {
      const response = await medicineService.adjustStock(
        session!.user.access_token,
        id,
        adjustment,
        reason
      );
      return response.result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      toast.success("Success", "Stock adjusted successfully");
    },
    onError: (error: any) => {
      toast.error(
        "Error",
        error?.response?.data?.error || "Failed to adjust stock"
      );
    },
  });
};

export const useDeleteMedicine = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await medicineService.deleteMedicine(
        session!.user.access_token,
        id
      );
      return response.result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      toast.success("Success", "Medicine deleted successfully");
    },
    onError: (error: any) => {
      toast.error(
        "Error",
        error?.response?.data?.error || "Failed to delete medicine"
      );
    },
  });
};

// ============================================================================
// BATCH MUTATIONS
// ============================================================================

export const useStockIn = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async (data: StockInData) => {
      const response = await medicineService.stockIn(
        session!.user.access_token,
        data
      );
      return response.result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      toast.success("Success", "Stock added successfully");
    },
    onError: (error: any) => {
      toast.error(
        "Error",
        error?.response?.data?.error || "Failed to stock in medicine"
      );
    },
  });
};

export const useStockOut = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async (data: StockOutData) => {
      const response = await medicineService.stockOut(
        session!.user.access_token,
        data
      );
      return response.result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      toast.success("Success", "Stock removed successfully using FIFO");
    },
    onError: (error: any) => {
      toast.error(
        "Error",
        error?.response?.data?.error || "Failed to stock out medicine"
      );
    },
  });
};

export const useUpdateBatchStatus = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async ({
      batchId,
      status,
      notes,
    }: {
      batchId: number;
      status: "active" | "expired" | "damaged";
      notes?: string;
    }) => {
      const response = await medicineService.updateBatchStatus(
        session!.user.access_token,
        batchId,
        status,
        notes
      );
      return response.result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      toast.success("Success", "Batch status updated successfully");
    },
    onError: (error: any) => {
      toast.error(
        "Error",
        error?.response?.data?.error || "Failed to update batch status"
      );
    },
  });
};
