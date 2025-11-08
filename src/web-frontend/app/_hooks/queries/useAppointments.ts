import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import AppointmentService, {
  Appointment,
  ConflictingSlot,
} from "@/app/_services/appointment.service";

const appointmentService = new AppointmentService();

/**
 * Hook to fetch user's appointments
 */
export const useGetAppointments = (options?: { refetchInterval?: number }) => {
  const { data: session } = useSession();
  const accessToken = session?.user?.access_token;

  return useQuery({
    queryKey: ["appointments"],
    queryFn: async () => {
      if (!accessToken) throw new Error("No access token");
      const response = await appointmentService.getAppointments(accessToken);
      if (!response.status || !response.result) {
        throw new Error(response.error || "Failed to fetch appointments");
      }
      return response.result;
    },
    enabled: !!accessToken,
    refetchInterval: options?.refetchInterval,
  });
};

/**
 * Hook to fetch a single appointment by ID
 */
export const useGetAppointment = (id: number) => {
  const { data: session } = useSession();
  const accessToken = session?.user?.access_token;

  return useQuery({
    queryKey: ["appointment", id],
    queryFn: async () => {
      if (!accessToken) throw new Error("No access token");
      const response = await appointmentService.getAppointmentById(
        id,
        accessToken
      );
      if (!response.status || !response.result) {
        throw new Error(response.error || "Failed to fetch appointment");
      }
      return response.result;
    },
    enabled: !!accessToken && !!id,
  });
};

/**
 * Hook to create a new appointment
 */
export const useCreateAppointment = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const accessToken = session?.user?.access_token;

  return useMutation({
    mutationFn: async (data: {
      doctorId: number;
      date: string;
      startTime: string;
      endTime: string;
      reason?: string;
    }) => {
      if (!accessToken) throw new Error("No access token");
      const response = await appointmentService.createAppointment(
        data,
        accessToken
      );
      if (!response.status || !response.result) {
        throw new Error(response.error || "Failed to create appointment");
      }
      return response.result;
    },
    onSuccess: () => {
      // Invalidate appointments list to refetch
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
};

/**
 * Hook to update an appointment
 */
export const useUpdateAppointment = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const accessToken = session?.user?.access_token;

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: Partial<{
        date: string;
        startTime: string;
        endTime: string;
        reason: string;
        status: "pending" | "confirmed" | "arrived" | "completed" | "cancelled";
      }>;
    }) => {
      if (!accessToken) throw new Error("No access token");
      const response = await appointmentService.updateAppointment(
        id,
        data,
        accessToken
      );
      if (!response.status || !response.result) {
        throw new Error(response.error || "Failed to update appointment");
      }
      return response.result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
};

/**
 * Hook to cancel an appointment
 */
export const useCancelAppointment = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const accessToken = session?.user?.access_token;

  return useMutation({
    mutationFn: async (id: number) => {
      if (!accessToken) throw new Error("No access token");
      const response = await appointmentService.cancelAppointment(
        id,
        accessToken
      );
      if (!response.status) {
        throw new Error(response.error || "Failed to cancel appointment");
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
};

/**
 * Hook to get conflicting appointments (for doctors)
 */
export const useGetConflicts = () => {
  const { data: session } = useSession();
  const accessToken = session?.user?.access_token;

  return useQuery({
    queryKey: ["appointmentConflicts"],
    queryFn: async () => {
      if (!accessToken) throw new Error("No access token");
      const response = await appointmentService.getConflicts(accessToken);
      if (!response.status || !response.result) {
        throw new Error(response.error || "Failed to fetch conflicts");
      }
      return response.result;
    },
    enabled: !!accessToken,
  });
};

/**
 * Hook to request reschedule (for doctors)
 */
export const useRequestReschedule = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const accessToken = session?.user?.access_token;

  return useMutation({
    mutationFn: async ({
      id,
      reason,
      proposedDate,
      proposedStartTime,
    }: {
      id: number;
      reason: string;
      proposedDate: string;
      proposedStartTime: string;
    }) => {
      if (!accessToken) throw new Error("No access token");
      const response = await appointmentService.requestReschedule(
        id,
        reason,
        proposedDate,
        proposedStartTime,
        accessToken
      );
      if (!response.status || !response.result) {
        throw new Error(response.error || "Failed to request reschedule");
      }
      return response.result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["appointmentConflicts"] });
    },
  });
};

/**
 * Hook to confirm reschedule (for patients)
 */
export const useConfirmReschedule = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const accessToken = session?.user?.access_token;

  return useMutation({
    mutationFn: async (id: number) => {
      if (!accessToken) throw new Error("No access token");
      const response = await appointmentService.confirmReschedule(
        id,
        accessToken
      );
      if (!response.status || !response.result) {
        throw new Error(response.error || "Failed to confirm reschedule");
      }
      return response.result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
};

/**
 * Hook to cancel appointment with reason
 */
export const useCancelWithReason = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const accessToken = session?.user?.access_token;

  return useMutation({
    mutationFn: async ({ id, reason }: { id: number; reason: string }) => {
      if (!accessToken) throw new Error("No access token");
      const response = await appointmentService.cancelWithReason(
        id,
        reason,
        accessToken
      );
      if (!response.status || !response.result) {
        throw new Error(response.error || "Failed to cancel appointment");
      }
      return response.result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
};
