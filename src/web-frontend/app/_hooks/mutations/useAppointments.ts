import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import AppointmentService from "@/app/_services/appointment.service";

const appointmentService = new AppointmentService();

export const useCreateAppointment = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: (data: {
      doctorId: number;
      date: string;
      startTime: string;
      endTime: string;
      reason?: string;
    }) => {
      const accessToken = session?.user?.access_token;
      if (!accessToken) throw new Error("No access token");
      return appointmentService.createAppointment(data, accessToken);
    },
    onSuccess: () => {
      // Invalidate and refetch appointments
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
};

export const useUpdateAppointment = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: ({
      appointmentId,
      data,
    }: {
      appointmentId: number;
      data: {
        date?: string;
        startTime?: string;
        endTime?: string;
        reason?: string;
        status?: "pending" | "confirmed" | "completed" | "cancelled";
      };
    }) => {
      const accessToken = session?.user?.access_token;
      if (!accessToken) throw new Error("No access token");
      return appointmentService.updateAppointment(
        appointmentId,
        data,
        accessToken
      );
    },
    onSuccess: () => {
      // Invalidate and refetch appointments
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
};

export const useCancelAppointment = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: (appointmentId: number) => {
      const accessToken = session?.user?.access_token;
      if (!accessToken) throw new Error("No access token");
      return appointmentService.cancelAppointment(appointmentId, accessToken);
    },
    onSuccess: () => {
      // Invalidate and refetch appointments
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
};
