import { useMutation, useQueryClient } from "@tanstack/react-query";
import DoctorService from "@/app/_services/doctor.service";

const doctorService = new DoctorService();

export const useSaveSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      doctorId,
      schedule,
    }: {
      doctorId: number;
      schedule: { day: string; startTime: string; endTime: string };
    }) => {
      const response = await doctorService.saveSchedule(doctorId, schedule);
      if (!response.status || !response.result) {
        throw new Error(response.error || "Failed to save schedule");
      }
      return response.result;
    },
    onSuccess: (_, variables) => {
      // Invalidate the doctor schedule query to refetch
      queryClient.invalidateQueries({
        queryKey: ["doctorSchedule", variables.doctorId],
      });
    },
  });
};

export const useUpdateSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      doctorId,
      scheduleId,
      schedule,
    }: {
      doctorId: number;
      scheduleId: number;
      schedule: { day: string; startTime: string; endTime: string };
    }) => {
      const response = await doctorService.updateSchedule(
        doctorId,
        scheduleId,
        schedule
      );
      if (!response.status || !response.result) {
        throw new Error(response.error || "Failed to update schedule");
      }
      return response.result;
    },
    onSuccess: (_, variables) => {
      // Invalidate the doctor schedule query to refetch
      queryClient.invalidateQueries({
        queryKey: ["doctorSchedule", variables.doctorId],
      });
    },
  });
};

export const useDeleteSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      doctorId,
      scheduleId,
    }: {
      doctorId: number;
      scheduleId: number;
    }) => {
      const response = await doctorService.deleteSchedule(doctorId, scheduleId);
      if (!response.status) {
        throw new Error(response.error || "Failed to delete schedule");
      }
      return response.result;
    },
    onSuccess: (_, variables) => {
      // Invalidate the doctor schedule query to refetch
      queryClient.invalidateQueries({
        queryKey: ["doctorSchedule", variables.doctorId],
      });
    },
  });
};
