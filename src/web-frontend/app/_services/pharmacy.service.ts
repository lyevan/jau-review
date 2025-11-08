import axios, { AxiosInstance } from "axios";
import { ResponseData } from "../_entities/interface/api.interface";

export interface MedicineSaleItem {
  medicineId: number;
  quantity: number;
  price: number;
}

export interface CreateMedicineSale {
  items: MedicineSaleItem[];
  notes?: string;
  discountType?: "none" | "senior" | "pwd";
  discountIdNumber?: string;
  discountPatientName?: string;
  cash?: number;
  prescriptionId?: number; // Optional: link sale to prescription fulfillment
}

export interface MedicineSale {
  id: number;
  processedById: number | null;
  subtotal: string;
  tax: string | null;
  total: string;
  createdAt: Date | null;
}

export interface MedicineSaleDetails extends MedicineSale {
  items: {
    id: number;
    saleId: number;
    medicineId: number;
    medicineName: string;
    quantity: number;
    unitPrice: string;
    subtotal: string;
  }[];
}

export interface GetSalesParams {
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export interface SalesTodaySummary {
  totalSales: number;
  totalRevenue: number;
  sales: MedicineSale[];
}

export class PharmacyService {
  private axios_instance: AxiosInstance;

  constructor() {
    this.axios_instance = axios.create({
      baseURL: `${process.env.NEXT_PUBLIC_API_URL}/pharmacy`,
    });
  }

  async createSale(
    access_token: string,
    data: CreateMedicineSale
  ): Promise<ResponseData<MedicineSale>> {
    const response = await this.axios_instance.post("/sales", data, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    return response.data;
  }

  async getSales(
    access_token: string,
    params?: GetSalesParams
  ): Promise<ResponseData<MedicineSale[]>> {
    const response = await this.axios_instance.get("/sales", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
      params,
    });
    return response.data;
  }

  async getSaleById(
    access_token: string,
    id: number
  ): Promise<ResponseData<MedicineSaleDetails>> {
    const response = await this.axios_instance.get(`/sales/${id}`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    return response.data;
  }

  async getTodaySummary(
    access_token: string
  ): Promise<ResponseData<SalesTodaySummary>> {
    const response = await this.axios_instance.get("/sales/today/summary", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    return response.data;
  }
}

const pharmacyService = new PharmacyService();
export default pharmacyService;
