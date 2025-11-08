import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import prescriptionService, {
  CreatePrescriptionData,
} from "@/app/_services/prescription.service";
import { toast } from "@/app/_utils/toast";

export const useCreatePrescription = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async (data: CreatePrescriptionData) => {
      const response = await prescriptionService.createPrescription(
        session!.user.access_token,
        data
      );
      return response.result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] });

      // Check if any items are unavailable
      if (data) {
        const unavailableItems = data.availabilityCheck.filter(
          (item: any) => !item.isAvailable
        );

        if (unavailableItems.length > 0) {
          toast.warning(
            "Prescription Created",
            `${unavailableItems.length} item(s) are out of stock or insufficient`
          );
        } else {
          toast.success(
            "Prescription Created",
            "All prescribed medicines are available in stock"
          );
        }
      }
    },
    onError: (error: any) => {
      toast.error(
        "Creation Failed",
        error?.response?.data?.error || "Failed to create prescription"
      );
    },
  });
};

export const useFulfillPrescription = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await prescriptionService.fulfillPrescription(
        session!.user.access_token,
        id
      );
      return response.result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
      queryClient.invalidateQueries({ queryKey: ["prescription"] });
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      toast.success(
        "Prescription Fulfilled",
        "Medicine inventory has been updated"
      );
    },
    onError: (error: any) => {
      toast.error(
        "Fulfillment Failed",
        error?.response?.data?.error || "Failed to fulfill prescription"
      );
    },
  });
};

export const useCancelPrescription = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await prescriptionService.cancelPrescription(
        session!.user.access_token,
        id
      );
      return response.result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
      queryClient.invalidateQueries({ queryKey: ["prescription"] });
      toast.success(
        "Prescription Cancelled",
        "Prescription has been cancelled"
      );
    },
    onError: (error: any) => {
      toast.error(
        "Cancellation Failed",
        error?.response?.data?.error || "Failed to cancel prescription"
      );
    },
  });
};
