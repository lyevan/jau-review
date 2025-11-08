import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import AnnouncementService, {
  Announcement,
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
} from "@/app/_services/announcement.service";
import { toast } from "@/app/_utils/toast";

const announcementService = new AnnouncementService();

// Query hook for fetching all announcements
export const useGetAnnouncements = () => {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      if (session?.user?.access_token) {
        announcementService.setAuthToken(session.user.access_token);
      }
      return await announcementService.getAnnouncements();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
};

// Query hook for fetching a single announcement
export const useGetAnnouncementById = (id: number) => {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["announcements", id],
    queryFn: async () => {
      if (session?.user?.access_token) {
        announcementService.setAuthToken(session.user.access_token);
      }
      return await announcementService.getAnnouncementById(id);
    },
    enabled: !!id,
  });
};

// Mutation hook for creating an announcement
export const useCreateAnnouncement = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAnnouncementDto) => {
      if (!session?.user?.access_token) {
        throw new Error("Not authenticated");
      }
      announcementService.setAuthToken(session.user.access_token);
      return await announcementService.createAnnouncement(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      toast.success("Announcement created successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create announcement");
    },
  });
};

// Mutation hook for updating an announcement
export const useUpdateAnnouncement = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: UpdateAnnouncementDto;
    }) => {
      if (!session?.user?.access_token) {
        throw new Error("Not authenticated");
      }
      announcementService.setAuthToken(session.user.access_token);
      return await announcementService.updateAnnouncement(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      queryClient.invalidateQueries({
        queryKey: ["announcements", variables.id],
      });
      toast.success("Announcement updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update announcement");
    },
  });
};

// Mutation hook for deleting an announcement
export const useDeleteAnnouncement = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      if (!session?.user?.access_token) {
        throw new Error("Not authenticated");
      }
      announcementService.setAuthToken(session.user.access_token);
      return await announcementService.deleteAnnouncement(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      toast.success("Announcement deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete announcement");
    },
  });
};
