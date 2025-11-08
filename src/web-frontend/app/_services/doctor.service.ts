/* PLUGINS */
import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
/* ENTITIES */
import { ResponseData } from "../_entities/interface/api.interface";

export interface Doctor {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  specialization: string;
  licenseNumber: string;
  yearsExperience: number;
  medicalSchool: string | null;
  biography: string | null;
  status: "active" | "inactive";
}

export interface DoctorSchedule {
  id: number;
  doctorId: number;
  day:
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday";
  startTime: string;
  endTime: string;
}

class DoctorService {
  private axios_instance: AxiosInstance;

  constructor(endpoint: string = "/doctors", config?: AxiosRequestConfig) {
    this.axios_instance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_BACKEND_API_URL + endpoint,
      headers: {
        "Content-Type": "application/json",
        ...config?.headers,
      },
      ...config,
    });
  }

  /**
   * Create a new doctor
   */
  async createDoctor(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    specialization: string;
    licenseNumber?: string;
    yearsExperience?: number;
    medicalSchool?: string;
    biography?: string;
    contactNumber?: string;
  }): Promise<ResponseData<Doctor>> {
    try {
      const response = await this.axios_instance.post("/", data);
      return response.data;
    } catch (error) {
      console.error("Error creating doctor:", error);
      throw error;
    }
  }

  /**
   * Get all doctors
   */
  async getDoctors(): Promise<ResponseData<Doctor[]>> {
    try {
      const response = await this.axios_instance.get("/");
      return response.data;
    } catch (error) {
      console.error("Error fetching doctors:", error);
      throw error;
    }
  }

  /**
   * Get a single doctor by ID
   */
  async getDoctorById(id: number): Promise<ResponseData<Doctor>> {
    try {
      const response = await this.axios_instance.get(`/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching doctor ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get doctor profile by user ID
   */
  async getDoctorByUserId(userId: number): Promise<ResponseData<Doctor>> {
    try {
      const response = await this.axios_instance.get(`/profile/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching doctor profile for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get doctor's schedule
   */
  async getDoctorSchedule(id: number): Promise<ResponseData<DoctorSchedule[]>> {
    try {
      const response = await this.axios_instance.get(`/${id}/schedule`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching doctor ${id} schedule:`, error);
      throw error;
    }
  }

  /**
   * Get doctor's appointments for a specific date
   */
  async getDoctorAppointments(
    doctorId: number,
    date: string
  ): Promise<ResponseData<any[]>> {
    try {
      const response = await this.axios_instance.get(
        `/${doctorId}/appointments`,
        {
          params: { date },
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching appointments for doctor ${doctorId} on ${date}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Create or update a schedule entry
   */
  async saveSchedule(
    doctorId: number,
    schedule: { day: string; startTime: string; endTime: string }
  ): Promise<ResponseData<DoctorSchedule>> {
    try {
      const response = await this.axios_instance.post(
        `/${doctorId}/schedule`,
        schedule
      );
      return response.data;
    } catch (error) {
      console.error(`Error saving schedule for doctor ${doctorId}:`, error);
      throw error;
    }
  }

  /**
   * Update a specific schedule entry
   */
  async updateSchedule(
    doctorId: number,
    scheduleId: number,
    schedule: { day: string; startTime: string; endTime: string }
  ): Promise<ResponseData<DoctorSchedule>> {
    try {
      const response = await this.axios_instance.put(
        `/${doctorId}/schedule/${scheduleId}`,
        schedule
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating schedule ${scheduleId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a schedule entry
   */
  async deleteSchedule(
    doctorId: number,
    scheduleId: number
  ): Promise<ResponseData<any>> {
    try {
      const response = await this.axios_instance.delete(
        `/${doctorId}/schedule/${scheduleId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error deleting schedule ${scheduleId}:`, error);
      throw error;
    }
  }
}

export default DoctorService;
