import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import consultationService, {
  CreateConsultationPayment,
  CompletePaymentData,
} from "@/app/_services/consultation.service";
import { toast } from "@/app/_utils/toast";

export const useCreateConsultationPayment = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async (data: CreateConsultationPayment) => {
      const response = await consultationService.createPayment(
        session!.user.access_token,
        data
      );
      return response.result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultation-payments"] });
      queryClient.invalidateQueries({
        queryKey: ["consultation-payments-today-summary"],
      });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success(
        "Payment Recorded",
        "Consultation payment has been recorded successfully"
      );
    },
    onError: (error: any) => {
      toast.error(
        "Payment Failed",
        error?.response?.data?.error || "Failed to record consultation payment"
      );
    },
  });
};

export const useCompleteConsultationPayment = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: CompletePaymentData;
    }) => {
      const response = await consultationService.completePayment(
        session!.user.access_token,
        id,
        data
      );
      return response.result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["consultation-payments-pending"],
      });
      queryClient.invalidateQueries({ queryKey: ["consultation-payments"] });
      queryClient.invalidateQueries({
        queryKey: ["consultation-payments-today-summary"],
      });
      toast.success(
        "Payment Completed",
        "Consultation payment has been completed successfully"
      );
    },
    onError: (error: any) => {
      toast.error(
        "Payment Failed",
        error?.response?.data?.error ||
          "Failed to complete consultation payment"
      );
    },
  });
};
