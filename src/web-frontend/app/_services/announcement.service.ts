import axios, { AxiosInstance } from "axios";
import { ResponseData } from "../_entities/interface/api.interface";

export interface Announcement {
  id: number;
  title: string;
  content: string;
  announcementType: "hours" | "closure" | "program" | "general";
  status: "active" | "inactive";
  date: string | null;
  startTime: string | null;
  endTime: string | null;
  createdAt: string;
  createdBy: {
    id: number;
    firstName: string;
    lastName: string;
  } | null;
}

export interface CreateAnnouncementDto {
  title: string;
  content: string;
  announcementType?: "hours" | "closure" | "program" | "general";
  status?: "active" | "inactive";
  date?: string | null;
  startTime?: string | null;
  endTime?: string | null;
}

export interface UpdateAnnouncementDto {
  title: string;
  content: string;
  announcementType: "hours" | "closure" | "program" | "general";
  status: "active" | "inactive";
  date?: string | null;
  startTime?: string | null;
  endTime?: string | null;
}

class AnnouncementService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: `${process.env.NEXT_PUBLIC_API_URL}/announcements`,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  setAuthToken(token: string) {
    this.axiosInstance.defaults.headers.common["Authorization"] =
      `Bearer ${token}`;
  }

  async getAnnouncements(): Promise<Announcement[]> {
    const response =
      await this.axiosInstance.get<ResponseData<Announcement[]>>("/");
    return response.data.result || [];
  }

  async getAnnouncementById(id: number): Promise<Announcement> {
    const response = await this.axiosInstance.get<ResponseData<Announcement>>(
      `/${id}`
    );
    if (!response.data.result) {
      throw new Error("Announcement not found");
    }
    return response.data.result;
  }

  async createAnnouncement(data: CreateAnnouncementDto): Promise<Announcement> {
    const response = await this.axiosInstance.post<ResponseData<Announcement>>(
      "/",
      data
    );
    if (!response.data.result) {
      throw new Error("Failed to create announcement");
    }
    return response.data.result;
  }

  async updateAnnouncement(
    id: number,
    data: UpdateAnnouncementDto
  ): Promise<Announcement> {
    const response = await this.axiosInstance.put<ResponseData<Announcement>>(
      `/${id}`,
      data
    );
    if (!response.data.result) {
      throw new Error("Failed to update announcement");
    }
    return response.data.result;
  }

  async deleteAnnouncement(id: number): Promise<{ id: number }> {
    const response = await this.axiosInstance.delete<
      ResponseData<{ id: number }>
    >(`/${id}`);
    if (!response.data.result) {
      throw new Error("Failed to delete announcement");
    }
    return response.data.result;
  }
}

export default AnnouncementService;
