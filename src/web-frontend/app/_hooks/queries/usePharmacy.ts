import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import pharmacyService, {
  GetSalesParams,
} from "@/app/_services/pharmacy.service";

export const useGetSales = (params?: GetSalesParams) => {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["pharmacy-sales", params],
    queryFn: async () => {
      const response = await pharmacyService.getSales(
        session!.user.access_token,
        params
      );
      return response.result;
    },
    enabled: !!session?.user?.access_token,
  });
};

export const useGetSaleById = (id: number) => {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["pharmacy-sale", id],
    queryFn: async () => {
      const response = await pharmacyService.getSaleById(
        session!.user.access_token,
        id
      );
      return response.result;
    },
    enabled: !!session?.user?.access_token && !!id,
  });
};

export const useGetTodaySalesSummary = () => {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["pharmacy-sales-today-summary"],
    queryFn: async () => {
      const response = await pharmacyService.getTodaySummary(
        session!.user.access_token
      );
      return response.result;
    },
    enabled: !!session?.user?.access_token,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });
};
