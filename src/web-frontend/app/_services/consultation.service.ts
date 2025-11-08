import axios, { AxiosInstance } from "axios";
import { ResponseData } from "../_entities/interface/api.interface";

export interface CreateConsultationPayment {
  appointmentId: number;
  consultationFee: number;
  tax?: number;
  totalAmount?: number;
  amountPaid: number;
  cash?: number;
  change?: number;
  paymentMethod?: "cash" | "card" | "gcash" | "maya";
  discountType?: "none" | "senior" | "pwd";
  discountIdNumber?: string;
  discountPatientName?: string;
}

export interface ConsultationPayment {
  id: number;
  transactionId: string;
  appointmentId: number;
  patientId: number;
  doctorId: number;
  consultationFee: string;
  tax: string;
  totalAmount: string;
  amountPaid: string | null;
  cash: string | null;
  change: string | null;
  paymentMethod: string | null;
  discountType: string | null;
  discountIdNumber: string | null;
  discountPatientName: string | null;
  dateProcessed: Date | null;
  status: "pending" | "completed" | "cancelled";
  createdAt?: Date;
  patientFirstName?: string;
  patientLastName?: string;
}

export interface GetConsultationPaymentsParams {
  startDate?: string;
  endDate?: string;
  patientId?: number;
  limit?: number;
}

export interface ConsultationPaymentsSummary {
  totalPayments: number;
  totalRevenue: number;
  payments: ConsultationPayment[];
}

export interface CompletePaymentData {
  amountPaid: number;
  paymentMethod: "cash" | "card" | "gcash" | "maya";
}

export class ConsultationService {
  private axios_instance: AxiosInstance;

  constructor() {
    this.axios_instance = axios.create({
      baseURL: `${process.env.NEXT_PUBLIC_API_URL}/consultations`,
    });
  }

  async createPayment(
    access_token: string,
    data: CreateConsultationPayment
  ): Promise<ResponseData<ConsultationPayment>> {
    const response = await this.axios_instance.post("/payments", data, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    return response.data;
  }

  async getPayments(
    access_token: string,
    params?: GetConsultationPaymentsParams
  ): Promise<ResponseData<ConsultationPayment[]>> {
    const response = await this.axios_instance.get("/payments", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
      params,
    });
    return response.data;
  }

  async getPaymentById(
    access_token: string,
    id: number
  ): Promise<ResponseData<ConsultationPayment>> {
    const response = await this.axios_instance.get(`/payments/${id}`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    return response.data;
  }

  async getTodaySummary(
    access_token: string
  ): Promise<ResponseData<ConsultationPaymentsSummary>> {
    const response = await this.axios_instance.get("/payments/today/summary", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    return response.data;
  }

  async getPendingPayments(
    access_token: string
  ): Promise<ResponseData<ConsultationPayment[]>> {
    const response = await this.axios_instance.get("/payments/pending", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    return response.data;
  }

  async completePayment(
    access_token: string,
    id: number,
    data: CompletePaymentData
  ): Promise<ResponseData<ConsultationPayment>> {
    const response = await this.axios_instance.put(
      `/payments/${id}/complete`,
      data,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    return response.data;
  }
}

const consultationService = new ConsultationService();
export default consultationService;
