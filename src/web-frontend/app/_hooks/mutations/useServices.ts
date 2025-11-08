import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import consultationServiceService, {
  CreateServiceData,
  UpdateServiceData,
} from "@/app/_services/service.service";
import { toast } from "@/app/_utils/toast";

export const useCreateConsultationService = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async (data: CreateServiceData) => {
      const response = await consultationServiceService.createService(
        session!.user.access_token,
        data
      );
      return response.result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultation-services"] });
      toast.success(
        "Service Created",
        "Consultation service has been created successfully"
      );
    },
    onError: (error: any) => {
      toast.error(
        "Creation Failed",
        error?.response?.data?.error || "Failed to create consultation service"
      );
    },
  });
};

export const useUpdateConsultationService = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: UpdateServiceData;
    }) => {
      const response = await consultationServiceService.updateService(
        session!.user.access_token,
        id,
        data
      );
      return response.result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultation-services"] });
      queryClient.invalidateQueries({ queryKey: ["consultation-service"] });
      toast.success(
        "Service Updated",
        "Consultation service has been updated successfully"
      );
    },
    onError: (error: any) => {
      toast.error(
        "Update Failed",
        error?.response?.data?.error || "Failed to update consultation service"
      );
    },
  });
};

export const useDeleteConsultationService = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await consultationServiceService.deleteService(
        session!.user.access_token,
        id
      );
      return response.result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultation-services"] });
      toast.success(
        "Service Deactivated",
        "Consultation service has been deactivated"
      );
    },
    onError: (error: any) => {
      toast.error(
        "Deactivation Failed",
        error?.response?.data?.error ||
          "Failed to deactivate consultation service"
      );
    },
  });
};
