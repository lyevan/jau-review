import axios, { AxiosInstance } from "axios";
import { ResponseData } from "../_entities/interface/api.interface";

export interface ConsultationService {
  id: number;
  name: string;
  description: string | null;
  price: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateServiceData {
  name: string;
  description?: string;
  price: number;
  isActive?: boolean;
}

export interface UpdateServiceData {
  name?: string;
  description?: string;
  price?: number;
  isActive?: boolean;
}

export class ConsultationServiceService {
  private axios_instance: AxiosInstance;

  constructor() {
    this.axios_instance = axios.create({
      baseURL: `${process.env.NEXT_PUBLIC_API_URL}/services`,
    });
  }

  async getServices(
    access_token: string,
    activeOnly?: boolean
  ): Promise<ResponseData<ConsultationService[]>> {
    const response = await this.axios_instance.get("/", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
      params: { activeOnly },
    });
    return response.data;
  }

  async getServiceById(
    access_token: string,
    id: number
  ): Promise<ResponseData<ConsultationService>> {
    const response = await this.axios_instance.get(`/${id}`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    return response.data;
  }

  async createService(
    access_token: string,
    data: CreateServiceData
  ): Promise<ResponseData<ConsultationService>> {
    const response = await this.axios_instance.post("/", data, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    return response.data;
  }

  async updateService(
    access_token: string,
    id: number,
    data: UpdateServiceData
  ): Promise<ResponseData<ConsultationService>> {
    const response = await this.axios_instance.put(`/${id}`, data, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    return response.data;
  }

  async deleteService(
    access_token: string,
    id: number
  ): Promise<ResponseData<ConsultationService>> {
    const response = await this.axios_instance.delete(`/${id}`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    return response.data;
  }
}

const consultationServiceService = new ConsultationServiceService();
export default consultationServiceService;
