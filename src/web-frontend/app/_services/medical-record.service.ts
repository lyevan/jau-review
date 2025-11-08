/* PLUGINS */
import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
/* ENTITIES */
import { ResponseData } from "../_entities/interface/api.interface";

export interface MedicalRecord {
  id: number;
  patientId: number;
  address: string | null;
  age: number | null;
  birthDate: string | null;
  contactNumber: string | null;
  pmhx: string | null; // Past Medical History
  fmhx: string | null; // Family Medical History
  pshx: string | null; // Past Surgical History
  createdAt: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Visit {
  id: number;
  medicalRecordId: number;
  attendingDoctorId: number | null;
  chiefComplaint: string | null;
  status: "scheduled" | "completed" | "cancelled";
  date: string;
  createdAt: string;
}

class MedicalRecordService {
  private axios_instance: AxiosInstance;

  constructor(
    endpoint: string = "/medical-records",
    config?: AxiosRequestConfig
  ) {
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
   * Get patient's medical record
   */
  async getMedicalRecord(
    access_token: string
  ): Promise<ResponseData<MedicalRecord>> {
    try {
      const response = await this.axios_instance.get("/", {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching medical record:", error);
      throw error;
    }
  }

  /**
   * Get patient's visit history
   */
  async getVisits(access_token: string): Promise<ResponseData<Visit[]>> {
    try {
      const response = await this.axios_instance.get("/visits", {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching visits:", error);
      throw error;
    }
  }
}

export default MedicalRecordService;
