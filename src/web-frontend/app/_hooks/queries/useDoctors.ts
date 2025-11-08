import { useQuery } from "@tanstack/react-query";
import DoctorService, {
  Doctor,
  DoctorSchedule,
} from "@/app/_services/doctor.service";

const doctorService = new DoctorService();

/**
 * Hook to fetch all doctors
 */
export const useGetDoctors = () => {
  return useQuery({
    queryKey: ["doctors"],
    queryFn: async () => {
      const response = await doctorService.getDoctors();
      if (!response.status || !response.result) {
        throw new Error(response.error || "Failed to fetch doctors");
      }
      return response.result;
    },
  });
};

/**
 * Hook to fetch a single doctor by ID
 */
export const useGetDoctor = (id: number) => {
  return useQuery({
    queryKey: ["doctor", id],
    queryFn: async () => {
      const response = await doctorService.getDoctorById(id);
      if (!response.status || !response.result) {
        throw new Error(response.error || "Failed to fetch doctor");
      }
      return response.result;
    },
    enabled: !!id,
  });
};

/**
 * Hook to fetch doctor profile by user ID
 */
export const useGetDoctorProfile = (userId: number | null) => {
  return useQuery({
    queryKey: ["doctorProfile", userId],
    queryFn: async () => {
      if (!userId) return null;
      const response = await doctorService.getDoctorByUserId(userId);
      return response;
    },
    enabled: !!userId,
  });
};

/**
 * Hook to fetch doctor's schedule
 */
export const useGetDoctorSchedule = (id: number) => {
  return useQuery({
    queryKey: ["doctorSchedule", id],
    queryFn: async () => {
      const response = await doctorService.getDoctorSchedule(id);
      if (!response.status || !response.result) {
        throw new Error(response.error || "Failed to fetch doctor schedule");
      }
      return response.result;
    },
    enabled: !!id,
  });
};

/**
 * Hook to fetch doctor's appointments for a specific date
 */
export const useGetDoctorAppointments = (doctorId: number, date?: string) => {
  return useQuery({
    queryKey: ["doctorAppointments", doctorId, date],
    queryFn: async () => {
      if (!date) return [];
      const response = await doctorService.getDoctorAppointments(
        doctorId,
        date
      );
      if (!response.status || !response.result) {
        throw new Error(
          response.error || "Failed to fetch doctor appointments"
        );
      }
      return response.result;
    },
    enabled: !!doctorId && !!date,
  });
};
