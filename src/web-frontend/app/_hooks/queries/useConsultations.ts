import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import consultationService, {
  GetConsultationPaymentsParams,
} from "@/app/_services/consultation.service";

export const useGetPendingConsultationPayments = () => {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["consultation-payments-pending"],
    queryFn: async () => {
      const response = await consultationService.getPendingPayments(
        session!.user.access_token
      );
      return response.result;
    },
    enabled: !!session?.user?.access_token,
    refetchInterval: 10000, // Refetch every 10 seconds for real-time updates
  });
};

export const useGetConsultationPayments = (
  params?: GetConsultationPaymentsParams
) => {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["consultation-payments", params],
    queryFn: async () => {
      const response = await consultationService.getPayments(
        session!.user.access_token,
        params
      );
      return response.result;
    },
    enabled: !!session?.user?.access_token,
  });
};

export const useGetConsultationPaymentById = (id: number) => {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["consultation-payment", id],
    queryFn: async () => {
      const response = await consultationService.getPaymentById(
        session!.user.access_token,
        id
      );
      return response.result;
    },
    enabled: !!session?.user?.access_token && !!id,
  });
};

export const useGetTodayConsultationSummary = () => {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["consultation-payments-today-summary"],
    queryFn: async () => {
      const response = await consultationService.getTodaySummary(
        session!.user.access_token
      );
      return response.result;
    },
    enabled: !!session?.user?.access_token,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });
};
