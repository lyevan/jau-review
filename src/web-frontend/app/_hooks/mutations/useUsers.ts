import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import UserService from "@/app/_services/user.service";
import { AddUserSchema, UpdateUserSchema } from "@/app/_schema/user.schema";
import { toast } from "@/app/_utils/toast";

const userService = new UserService();

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async (data: AddUserSchema) => {
      return await userService.addUser(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Success", "User created successfully");
    },
    onError: (error: any) => {
      toast.error("Error", error?.message || "Failed to create user");
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async (data: UpdateUserSchema) => {
      return await userService.updateUser(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Success", "User updated successfully");
    },
    onError: (error: any) => {
      toast.error("Error", error?.message || "Failed to update user");
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async (userId: number) => {
      return await userService.deleteUser(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Success", "User deleted successfully");
    },
    onError: (error: any) => {
      toast.error("Error", error?.message || "Failed to delete user");
    },
  });
};
