/* PLUGINS */
import APIClient from "@/app/_utils/apiClient";

/* ENTITIES */
import { GetUserParams, User } from "@/app/_entities/interface/user.interface";

/* SCHEMA */
import { AddUserSchema, UpdateUserSchema } from "@/app/_schema/user.schema";

/* CONSTANTS */
import { ONE } from "@/app/_constants";

class UserService extends APIClient {
  constructor() {
    // Using /users because base URL already includes /api
    // (NEXT_PUBLIC_BACKEND_API_URL = http://localhost:8000/api)
    super("/users");
  }

  /**
   * DOCU: Fetches a list of users with optional filtering and sorting. <br>
   * Triggered: When a component needs to display a list of users. <br>
   * Last Updated: August 27, 2025
   *
   */
  getUsers = (params?: GetUserParams) => {
    console.log("📥 Received params:", params);

    // Filter out null values from params
    const cleanParams = params
      ? Object.fromEntries(
          Object.entries(params).filter(([key, v]) => {
            console.log(`  ${key}:`, v, typeof v, v !== null);
            return v !== null;
          })
        )
      : {};

    console.log("🔍 Sending user params:", cleanParams);

    return this.get<User[]>("/", {
      params: { ...cleanParams, page: cleanParams.page || ONE },
    })
      .then((res) => {
        if (!res.status) {
          throw res.error;
        }
        return res.result || [];
      })
      .catch((error) => {
        throw error;
      });
  };

  /**
   * DOCU: Fetches a single user by ID. <br>
   * Triggered: When viewing user details. <br>
   * Last Updated: October 27, 2025
   *
   */
  getUserById = (id: number) => {
    return this.get<any>(`/${id}`)
      .then((res) => {
        if (!res.status) {
          throw res.error;
        }
        return res.result;
      })
      .catch((error) => {
        throw error;
      });
  };

  /**
   * DOCU: Adds a new user to the system. <br>
   * Triggered: When a new user needs to be created. <br>
   * Last Updated: October 29, 2025 - Updated for Node.js backend
   *
   */
  addUser = async (data: AddUserSchema) => {
    // Transform data to match Node.js backend structure
    const transformedData = {
      username: data.email?.split("@")[0] || "", // Generate username from email
      email: data.email || "",
      password: "TempPassword123!", // TODO: This should come from the form
      firstName: data.first_name || "",
      lastName: data.last_name || "",
      role: this.mapAccessToRole(data.access),
    };

    const response = await this.post<any>("/", transformedData);
    if (!response.status || !response.result) {
      throw response.error || new Error("Failed to add user");
    }
    return response.result;
  };

  /**
   * DOCU: Updates an existing user's information. <br>
   * Triggered: When a user's information needs to be updated. <br>
   * Last Updated: October 29, 2025 - Updated for Node.js backend with PATCH method
   *
   */
  updateUser = (data: UpdateUserSchema) => {
    // Transform data to match Node.js backend structure
    const transformedData = {
      email: data.email,
      firstName: data.first_name,
      lastName: data.last_name,
      role: this.mapAccessToRole(data.access),
    };

    return this.patch<any>(`/${data.id}`, transformedData)
      .then((res) => {
        if (!res.status) {
          throw res.error;
        }
        return res.result;
      })
      .catch((error) => {
        throw error;
      });
  };

  /**
   * DOCU: Helper function to map Access enum to role string. <br>
   * Last Updated: October 29, 2025
   */
  private mapAccessToRole = (access?: any): string => {
    // Map Access enum values to role strings
    // Access.1 = admin, Access.2 = patient, Access.3 = doctor, Access.4 = staff
    const accessMap: Record<number, string> = {
      1: "admin",
      2: "patient",
      3: "doctor",
      4: "staff",
    };

    return accessMap[access] || "patient";
  };

  /**
   * DOCU: Deletes a user by ID. <br>
   * Triggered: When a user needs to be removed from the system. <br>
   * Last Updated: August 7, 2025
   *
   */
  deleteUser = (user_id: number) => {
    return this.delete<{ success: boolean }>(`/${user_id}`)
      .then((res) => {
        if (!res.status) {
          throw res.error;
        }
        return res.result;
      })
      .catch((error) => {
        throw error;
      });
  };
}

export default UserService;
