import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import MedicalRecordService, {
  MedicalRecord,
  Visit,
} from "@/app/_services/medical-record.service";

const medicalRecordService = new MedicalRecordService();

/**
 * Hook to fetch patient's medical record
 */
export const useGetMedicalRecord = () => {
  const { data: session } = useSession();
  const accessToken = session?.user?.access_token;

  return useQuery({
    queryKey: ["medicalRecord"],
    queryFn: async () => {
      if (!accessToken) throw new Error("No access token");
      const response = await medicalRecordService.getMedicalRecord(accessToken);
      if (!response.status || !response.result) {
        throw new Error(response.error || "Failed to fetch medical record");
      }
      return response.result;
    },
    enabled: !!accessToken,
  });
};

/**
 * Hook to fetch patient's visit history
 */
export const useGetVisits = () => {
  const { data: session } = useSession();
  const accessToken = session?.user?.access_token;

  return useQuery({
    queryKey: ["visits"],
    queryFn: async () => {
      if (!accessToken) throw new Error("No access token");
      const response = await medicalRecordService.getVisits(accessToken);
      if (!response.status || !response.result) {
        throw new Error(response.error || "Failed to fetch visits");
      }
      return response.result;
    },
    enabled: !!accessToken,
  });
};
