import axios, { AxiosInstance } from "axios";
import { ResponseData } from "../_entities/interface/api.interface";

export interface PrescriptionItem {
  id?: number;
  prescriptionId?: number;
  medicineId: number;
  quantity: number;
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
  isAvailable?: boolean;
  medicineName?: string;
  medicinePrice?: string;
  medicineStock?: number;
}

export interface Prescription {
  id: number;
  visitId: number;
  patientId: number;
  doctorId: number | null;
  status: "pending" | "fulfilled" | "cancelled";
  notes: string | null;
  createdAt: Date;
  fulfilledAt: Date | null;
  patientFirstName?: string;
  patientLastName?: string;
  doctorFirstName?: string;
  doctorLastName?: string;
  items?: PrescriptionItem[];
}

export interface CreatePrescriptionData {
  visitId: number;
  patientId: number;
  doctorId?: number; // Optional - backend will get from session
  notes?: string;
  items: PrescriptionItem[];
}

export class PrescriptionService {
  private axios_instance: AxiosInstance;

  constructor() {
    this.axios_instance = axios.create({
      baseURL: `${process.env.NEXT_PUBLIC_API_URL}/prescriptions`,
    });
  }

  async createPrescription(
    access_token: string,
    data: CreatePrescriptionData
  ): Promise<ResponseData<{ prescription: Prescription; items: PrescriptionItem[]; availabilityCheck: any[] }>> {
    console.log("\n========================================");
    console.log("💊 PrescriptionService.createPrescription");
    console.log("========================================");
    console.log("API URL:", `${process.env.NEXT_PUBLIC_API_URL}/prescriptions`);
    console.log("Data being sent:", JSON.stringify(data, null, 2));
    console.log("Has access token?", !!access_token);
    console.log("Token preview:", access_token ? access_token.substring(0, 20) + "..." : "NONE");
    console.log("========================================\n");
    
    try {
      const response = await this.axios_instance.post("/", data, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
      
      console.log("\n========================================");
      console.log("✅ Prescription API response received");
      console.log("========================================");
      console.log("Status:", response.status);
      console.log("Response data:", JSON.stringify(response.data, null, 2));
      console.log("========================================\n");
      
      return response.data;
    } catch (error: any) {
      console.error("\n========================================");
      console.error("❌ Prescription API ERROR");
      console.error("========================================");
      console.error("Error:", error);
      console.error("Response status:", error.response?.status);
      console.error("Response data:", error.response?.data);
      console.error("========================================\n");
      throw error;
    }
  }

  async getPrescriptions(
    access_token: string,
    params?: {
      visitId?: number;
      patientId?: number;
      status?: "pending" | "fulfilled" | "cancelled";
    }
  ): Promise<ResponseData<Prescription[]>> {
    const response = await this.axios_instance.get("/", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
      params,
    });
    return response.data;
  }

  async getPrescriptionById(
    access_token: string,
    id: number
  ): Promise<ResponseData<Prescription>> {
    const response = await this.axios_instance.get(`/${id}`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    return response.data;
  }

  async fulfillPrescription(
    access_token: string,
    id: number
  ): Promise<ResponseData<Prescription>> {
    const response = await this.axios_instance.put(
      `/${id}/fulfill`,
      {},
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    return response.data;
  }

  async cancelPrescription(
    access_token: string,
    id: number
  ): Promise<ResponseData<Prescription>> {
    const response = await this.axios_instance.put(
      `/${id}/cancel`,
      {},
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    return response.data;
  }
}

const prescriptionService = new PrescriptionService();
export default prescriptionService;
