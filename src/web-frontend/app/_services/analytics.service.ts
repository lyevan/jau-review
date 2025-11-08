import axios, { AxiosInstance } from "axios";
import { ResponseData } from "../_entities/interface/api.interface";

export interface DashboardAnalytics {
  overview: {
    totalPatients: number;
    totalDoctors: number;
    totalAppointments: number;
    totalVisits: number;
    pendingAppointments: number;
  };
  today: {
    appointments: number;
    revenue: number;
    medicineRevenue: number;
    consultationRevenue: number;
    medicineSalesCount: number;
    consultationPaymentsCount: number;
  };
  month: {
    revenue: number;
    medicineRevenue: number;
    consultationRevenue: number;
    medicineSalesCount: number;
    consultationPaymentsCount: number;
  };
  inventory: {
    lowStockCount: number;
    lowStockMedicines: {
      id: number;
      name: string;
      stock: number;
      reorderLevel: number;
    }[];
  };
  appointments: {
    byStatus: Record<string, number>;
    recent: number;
  };
}

export interface RevenueAnalytics {
  summary: {
    totalRevenue: number;
    medicineRevenue: number;
    consultationRevenue: number;
    medicineSalesCount: number;
    consultationPaymentsCount: number;
  };
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  groupedData?: {
    period: string;
    medicineRevenue: number;
    consultationRevenue: number;
    totalRevenue: number;
    count: number;
  }[];
}

export interface AppointmentAnalytics {
  total: number;
  byStatus: Record<string, number>;
  byDoctor: Record<number, number>;
  byDay: {
    date: string;
    count: number;
  }[];
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
}

export interface InventoryAnalytics {
  total: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalInventoryValue: number;
  byCategory: Record<
    string,
    {
      count: number;
      totalValue: number;
      lowStock: number;
    }
  >;
  lowStockMedicines: {
    id: number;
    name: string;
    stock: number;
    reorderLevel: number;
    category: string | null;
  }[];
  outOfStockMedicines: {
    id: number;
    name: string;
    category: string | null;
  }[];
}

export interface GetRevenueParams {
  startDate?: string;
  endDate?: string;
  groupBy?: "day" | "week" | "month";
}

export interface GetAppointmentParams {
  startDate?: string;
  endDate?: string;
}

export interface PatientGrowthAnalytics {
  totalPatients: number;
  groupedData: {
    month: string;
    count: number;
  }[];
}

export interface DiagnosisDistribution {
  total: number;
  distribution: {
    name: string;
    code: string;
    value: number;
    percentage: string;
    color: string;
  }[];
}

export interface Transaction {
  id: string;
  type: string;
  amount: number;
  date: string; // Date string in YYYY-MM-DD format
  status: string;
  patientId: number | null;
  patientName: string;
}

export interface TransactionAnalytics {
  total: number;
  transactions: Transaction[];
}

export interface WaitTimeAnalytics {
  averageWaitTime: number;
  distribution: {
    range: string;
    count: number;
  }[];
}

export interface TopSellingMedicine {
  rank: number;
  medicineId: number;
  medicine: string;
  brandName: string | null;
  genericName: string | null;
  sold: number;
  revenue: number;
  transactions: number;
}

export interface TopSellingMedicinesResponse {
  data: TopSellingMedicine[];
  period: {
    days: number;
    start: string;
    end: string;
  };
}

export interface GetTopSellingParams {
  limit?: number;
  days?: number;
}

export interface GetTransactionParams {
  startDate?: string;
  endDate?: string;
  type?: "consultation" | "pharmacy";
}

export interface GetDiagnosisParams {
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export class AnalyticsService {
  private axios_instance: AxiosInstance;

  constructor() {
    this.axios_instance = axios.create({
      baseURL: `${process.env.NEXT_PUBLIC_API_URL}/analytics`,
    });
  }

  async getDashboard(
    access_token: string
  ): Promise<ResponseData<DashboardAnalytics>> {
    const response = await this.axios_instance.get("/dashboard", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    return response.data;
  }

  async getRevenue(
    access_token: string,
    params?: GetRevenueParams
  ): Promise<ResponseData<RevenueAnalytics>> {
    const response = await this.axios_instance.get("/revenue", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
      params,
    });
    return response.data;
  }

  async getAppointments(
    access_token: string,
    params?: GetAppointmentParams
  ): Promise<ResponseData<AppointmentAnalytics>> {
    const response = await this.axios_instance.get("/appointments", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
      params,
    });
    return response.data;
  }

  async getInventory(
    access_token: string
  ): Promise<ResponseData<InventoryAnalytics>> {
    const response = await this.axios_instance.get("/inventory", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    return response.data;
  }

  async getPatientGrowth(
    access_token: string,
    params?: { startDate?: string; endDate?: string }
  ): Promise<ResponseData<PatientGrowthAnalytics>> {
    const response = await this.axios_instance.get("/patient-growth", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
      params,
    });
    return response.data;
  }

  async getDiagnosisDistribution(
    access_token: string,
    params?: GetDiagnosisParams
  ): Promise<ResponseData<DiagnosisDistribution>> {
    const response = await this.axios_instance.get("/diagnosis-distribution", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
      params,
    });
    return response.data;
  }

  async getTransactions(
    access_token: string,
    params?: GetTransactionParams
  ): Promise<ResponseData<TransactionAnalytics>> {
    const response = await this.axios_instance.get("/transactions", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
      params,
    });
    return response.data;
  }

  async getWaitTime(
    access_token: string
  ): Promise<ResponseData<WaitTimeAnalytics>> {
    const response = await this.axios_instance.get("/wait-time", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    return response.data;
  }

  async getTopSellingMedicines(
    access_token: string,
    params?: GetTopSellingParams
  ): Promise<ResponseData<TopSellingMedicinesResponse>> {
    const response = await this.axios_instance.get("/top-selling-medicines", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
      params,
    });
    return response.data;
  }
}

const analyticsService = new AnalyticsService();
export default analyticsService;
