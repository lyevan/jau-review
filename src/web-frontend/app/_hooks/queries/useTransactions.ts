import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import transactionService, {
  GetTransactionsParams,
} from "@/app/_services/transaction.service";

export const useGetTransactions = (params?: GetTransactionsParams) => {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["transactions", params],
    queryFn: async () => {
      const response = await transactionService.getTransactions(
        session!.user.access_token,
        params
      );
      return response.result;
    },
    enabled: !!session?.user?.access_token,
  });
};

export const useGetTransactionSummary = (params?: {
  startDate?: string;
  endDate?: string;
}) => {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["transaction-summary", params],
    queryFn: async () => {
      const response = await transactionService.getSummary(
        session!.user.access_token,
        params
      );
      return response.result;
    },
    enabled: !!session?.user?.access_token,
  });
};

export const useGetTodayTransactions = () => {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["transactions-today"],
    queryFn: async () => {
      const response = await transactionService.getTodayTransactions(
        session!.user.access_token
      );
      return response.result;
    },
    enabled: !!session?.user?.access_token,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });
};
