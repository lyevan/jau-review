import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import UserService from "@/app/_services/user.service";
import { GetUserParams } from "@/app/_entities/interface/user.interface";

const userService = new UserService();

export const useGetUsers = (params?: GetUserParams) => {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["users", params],
    queryFn: () => userService.getUsers(params),
    enabled: !!session?.user?.access_token,
  });
};

export const useGetUserById = (id: number) => {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["user", id],
    queryFn: async () => {
      return await userService.getUserById(id);
    },
    enabled: !!session?.user?.access_token && !!id,
  });
};
