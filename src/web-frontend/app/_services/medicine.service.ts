import axios, { AxiosInstance } from "axios";
import { ResponseData } from "../_entities/interface/api.interface";

export interface Medicine {
  id: number;
  name: string;
  description: string | null;
  brandName: string | null;
  genericName: string | null;
  specification: string | null;
  price: number;
  stock: number;
  minStock: number;
  unit: string;
  expirationDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMedicineData {
  name?: string;
  description?: string;
  brandName?: string;
  genericName?: string;
  specification?: string;
  price: number;
  stock: number;
  minStock?: number;
  unit?: string;
  expirationDate?: string;
}

export interface UpdateMedicineData {
  name?: string;
  description?: string;
  brandName?: string;
  genericName?: string;
  specification?: string;
  price?: number;
  stock?: number;
  minStock?: number;
  unit?: string;
  expirationDate?: string;
}

export interface MedicineBatch {
  id: number;
  medicineId: number;
  batchNumber: string;
  quantity: number;
  originalQuantity: number;
  stockInDate: string;
  expiryDate: string | null;
  manufactureDate: string | null;
  supplier: string | null;
  costPrice: number | null;
  status: "active" | "expired" | "damaged";
  notes: string | null;
  createdById: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface StockInData {
  medicineId: number;
  batchNumber: string;
  quantity: number;
  expiryDate?: string;
  manufactureDate?: string;
  supplier?: string;
  costPrice?: number;
  notes?: string;
}

export interface StockOutData {
  medicineId: number;
  quantity: number;
  reason: string;
  notes: string;
}

export class MedicineService {
  private axios_instance: AxiosInstance;

  constructor() {
    this.axios_instance = axios.create({
      baseURL: `${process.env.NEXT_PUBLIC_API_URL}/medicines`,
    });
  }

  async getAllMedicines(
    access_token: string,
    params?: {
      search?: string;
      category?: string;
      lowStock?: boolean;
    }
  ): Promise<ResponseData<Medicine[]>> {
    try {
      const response = await this.axios_instance.get("/", {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
        params: {
          ...params,
          lowStock: params?.lowStock ? "true" : undefined,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getMedicineById(
    access_token: string,
    id: number
  ): Promise<ResponseData<Medicine>> {
    try {
      const response = await this.axios_instance.get(`/${id}`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async createMedicine(
    access_token: string,
    data: CreateMedicineData
  ): Promise<ResponseData<Medicine>> {
    try {
      const response = await this.axios_instance.post("/", data, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateMedicine(
    access_token: string,
    id: number,
    data: UpdateMedicineData
  ): Promise<ResponseData<Medicine>> {
    try {
      const response = await this.axios_instance.patch(`/${id}`, data, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async adjustStock(
    access_token: string,
    id: number,
    adjustment: number,
    reason?: string
  ): Promise<ResponseData<Medicine>> {
    try {
      const response = await this.axios_instance.post(
        `/${id}/adjust-stock`,
        { adjustment, reason },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getLowStockAlerts(
    access_token: string
  ): Promise<ResponseData<Medicine[]>> {
    try {
      const response = await this.axios_instance.get("/low-stock/alerts", {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteMedicine(
    access_token: string,
    id: number
  ): Promise<ResponseData<{ message: string }>> {
    try {
      const response = await this.axios_instance.delete(`/${id}`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // ============================================================================
  // BATCH MANAGEMENT METHODS
  // ============================================================================

  async getBatchesByMedicine(
    access_token: string,
    medicineId: number
  ): Promise<ResponseData<MedicineBatch[]>> {
    try {
      const response = await this.axios_instance.get(`/${medicineId}/batches`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async stockIn(
    access_token: string,
    data: StockInData
  ): Promise<ResponseData<MedicineBatch>> {
    try {
      const response = await this.axios_instance.post("/stock-in", data, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async stockOut(
    access_token: string,
    data: StockOutData
  ): Promise<ResponseData<any>> {
    try {
      const response = await this.axios_instance.post("/stock-out", data, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateBatchStatus(
    access_token: string,
    batchId: number,
    status: "active" | "expired" | "damaged",
    notes?: string
  ): Promise<ResponseData<MedicineBatch>> {
    try {
      const response = await this.axios_instance.patch(
        `/batches/${batchId}/status`,
        { status, notes },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}
