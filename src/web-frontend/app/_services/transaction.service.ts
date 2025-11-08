import axios, { AxiosInstance } from "axios";
import { ResponseData } from "../_entities/interface/api.interface";

export interface TransactionItem {
  id: number;
  medicineId: number;
  name: string;
  brandName: string | null;
  genericName: string | null;
  quantity: number;
  price: string;
}

export interface Transaction {
  id: number;
  transactionId?: string;
  patientId?: number;
  totalAmount: string;
  paymentMethod?: string;
  date: Date;
  processedById: number | null;
  processedByFirstName?: string | null;
  processedByLastName?: string | null;
  patientFirstName?: string;
  patientLastName?: string;
  doctorFirstName?: string;
  doctorLastName?: string;
  type: "medicine" | "consultation";
  description: string;
  subtotal?: string;
  tax?: string;
  discountType?: string | null;
  discountIdNumber?: string | null;
  discountPatientName?: string | null;
  cash?: string | null;
  change?: string | null;
  items?: TransactionItem[]; // Add items array for medicine sales
}

export interface GetTransactionsParams {
  type?: "medicine" | "consultation";
  startDate?: string;
  endDate?: string;
  patientId?: number;
  limit?: number;
}

export interface TransactionSummary {
  totalTransactions: number;
  totalRevenue: number;
  medicineSales: {
    count: number;
    revenue: number;
  };
  consultationPayments: {
    count: number;
    revenue: number;
  };
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
}

export class TransactionService {
  private axios_instance: AxiosInstance;

  constructor() {
    this.axios_instance = axios.create({
      baseURL: `${process.env.NEXT_PUBLIC_API_URL}/transactions`,
    });
  }

  async getTransactions(
    access_token: string,
    params?: GetTransactionsParams
  ): Promise<ResponseData<Transaction[]>> {
    const response = await this.axios_instance.get("/", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
      params,
    });
    return response.data;
  }

  async getSummary(
    access_token: string,
    params?: { startDate?: string; endDate?: string }
  ): Promise<ResponseData<TransactionSummary>> {
    const response = await this.axios_instance.get("/summary", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
      params,
    });
    return response.data;
  }

  async getTodayTransactions(
    access_token: string
  ): Promise<ResponseData<Transaction[]>> {
    const response = await this.axios_instance.get("/today", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    return response.data;
  }
}

const transactionService = new TransactionService();
export default transactionService;
