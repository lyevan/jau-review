import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { MedicineService } from "@/app/_services/medicine.service";

const medicineService = new MedicineService();

interface UseGetMedicinesParams {
  search?: string;
  category?: string;
  lowStock?: boolean;
  refetchInterval?: number;
}

export const useGetMedicines = (params?: UseGetMedicinesParams) => {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["medicines", params],
    queryFn: async () => {
      const response = await medicineService.getAllMedicines(
        session!.user.access_token,
        params
      );
      return response.result || [];
    },
    enabled: !!session?.user?.access_token,
    refetchInterval: params?.refetchInterval,
  });
};

export const useGetMedicineById = (id: number) => {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["medicine", id],
    queryFn: async () => {
      const response = await medicineService.getMedicineById(
        session!.user.access_token,
        id
      );
      return response.result;
    },
    enabled: !!session?.user?.access_token && !!id,
  });
};

export const useGetLowStockAlerts = () => {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["medicines", "low-stock"],
    queryFn: async () => {
      const response = await medicineService.getLowStockAlerts(
        session!.user.access_token
      );
      return response.result || [];
    },
    enabled: !!session?.user?.access_token,
  });
};
