import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import consultationServiceService from "@/app/_services/service.service";

export const useGetConsultationServices = (activeOnly?: boolean) => {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["consultation-services", activeOnly],
    queryFn: async () => {
      const response = await consultationServiceService.getServices(
        session!.user.access_token,
        activeOnly
      );
      return response.result;
    },
    enabled: !!session?.user?.access_token,
  });
};

export const useGetConsultationServiceById = (id: number) => {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["consultation-service", id],
    queryFn: async () => {
      const response = await consultationServiceService.getServiceById(
        session!.user.access_token,
        id
      );
      return response.result;
    },
    enabled: !!session?.user?.access_token && !!id,
  });
};
