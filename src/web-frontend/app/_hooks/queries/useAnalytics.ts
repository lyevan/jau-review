import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import analyticsService, {
  GetRevenueParams,
  GetAppointmentParams,
  GetTransactionParams,
  GetDiagnosisParams,
  GetTopSellingParams,
} from "@/app/_services/analytics.service";

export const useGetDashboardAnalytics = () => {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["analytics-dashboard"],
    queryFn: async () => {
      const response = await analyticsService.getDashboard(
        session!.user.access_token
      );
      return response.result;
    },
    enabled: !!session?.user?.access_token,
    refetchInterval: 60000, // Refetch every minute for real-time updates
  });
};

export const useGetRevenueAnalytics = (params?: GetRevenueParams) => {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["analytics-revenue", params],
    queryFn: async () => {
      const response = await analyticsService.getRevenue(
        session!.user.access_token,
        params
      );
      return response.result;
    },
    enabled: !!session?.user?.access_token,
  });
};

export const useGetAppointmentAnalytics = (params?: GetAppointmentParams) => {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["analytics-appointments", params],
    queryFn: async () => {
      const response = await analyticsService.getAppointments(
        session!.user.access_token,
        params
      );
      return response.result;
    },
    enabled: !!session?.user?.access_token,
  });
};

export const useGetInventoryAnalytics = () => {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["analytics-inventory"],
    queryFn: async () => {
      const response = await analyticsService.getInventory(
        session!.user.access_token
      );
      return response.result;
    },
    enabled: !!session?.user?.access_token,
    refetchInterval: 300000, // Refetch every 5 minutes
  });
};

export const useGetPatientGrowth = (params?: {
  startDate?: string;
  endDate?: string;
}) => {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["analytics-patient-growth", params],
    queryFn: async () => {
      const response = await analyticsService.getPatientGrowth(
        session!.user.access_token,
        params
      );
      return response.result;
    },
    enabled: !!session?.user?.access_token,
  });
};

export const useGetDiagnosisDistribution = (params?: GetDiagnosisParams) => {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["analytics-diagnosis-distribution", params],
    queryFn: async () => {
      const response = await analyticsService.getDiagnosisDistribution(
        session!.user.access_token,
        params
      );
      return response.result;
    },
    enabled: !!session?.user?.access_token,
  });
};

export const useGetTransactions = (params?: GetTransactionParams) => {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["analytics-transactions", params],
    queryFn: async () => {
      const response = await analyticsService.getTransactions(
        session!.user.access_token,
        params
      );
      return response.result;
    },
    enabled: !!session?.user?.access_token,
  });
};

export const useGetWaitTime = () => {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["analytics-wait-time"],
    queryFn: async () => {
      const response = await analyticsService.getWaitTime(
        session!.user.access_token
      );
      return response.result;
    },
    enabled: !!session?.user?.access_token,
    refetchInterval: 300000, // Refetch every 5 minutes
  });
};

export const useGetTopSellingMedicines = (params?: GetTopSellingParams) => {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["analytics-top-selling", params],
    queryFn: async () => {
      const response = await analyticsService.getTopSellingMedicines(
        session!.user.access_token,
        params
      );
      return response.result;
    },
    enabled: !!session?.user?.access_token,
  });
};
