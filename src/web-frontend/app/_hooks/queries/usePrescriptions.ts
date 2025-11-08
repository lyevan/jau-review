import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import prescriptionService from "@/app/_services/prescription.service";

export const useGetPrescriptions = (params?: {
  visitId?: number;
  patientId?: number;
  status?: "pending" | "fulfilled" | "cancelled";
}) => {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["prescriptions", params],
    queryFn: async () => {
      const response = await prescriptionService.getPrescriptions(
        session!.user.access_token,
        params
      );
      return response.result;
    },
    enabled: !!session?.user?.access_token,
  });
};

export const useGetPrescriptionById = (id: number) => {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["prescription", id],
    queryFn: async () => {
      const response = await prescriptionService.getPrescriptionById(
        session!.user.access_token,
        id
      );
      return response.result;
    },
    enabled: !!session?.user?.access_token && !!id,
  });
};
