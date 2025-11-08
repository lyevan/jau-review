import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import pharmacyService, {
  CreateMedicineSale,
} from "@/app/_services/pharmacy.service";
import { toast } from "@/app/_utils/toast";

export const useCreateMedicineSale = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async (data: CreateMedicineSale) => {
      const response = await pharmacyService.createSale(
        session!.user.access_token,
        data
      );
      return response.result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pharmacy-sales"] });
      queryClient.invalidateQueries({
        queryKey: ["pharmacy-sales-today-summary"],
      });
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      toast.success(
        "Sale Completed",
        "Medicine sale has been recorded successfully"
      );
    },
    onError: (error: any) => {
      toast.error(
        "Sale Failed",
        error?.response?.data?.error || "Failed to record medicine sale"
      );
    },
  });
};
