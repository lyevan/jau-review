/* PLUGINS */
import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
/* ENTITIES */
import { ResponseData } from "../_entities/interface/api.interface";

export interface Appointment {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  status:
    | "pending"
    | "confirmed"
    | "arrived"
    | "completed"
    | "cancelled"
    | "reschedule_requested";
  reason: string | null;
  rescheduleReason?: string | null;
  conflictingAppointmentId?: number | null;
  priority?: number;
  proposedDate?: string | null;
  proposedStartTime?: string | null;
  cancellationReason?: string | null;
  createdAt: string;
  doctor?: {
    id: number;
    firstName: string;
    lastName: string;
    specialization: string;
  };
  patient?: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

export interface ConflictingSlot {
  date: string;
  startTime: string;
  count: number;
  appointments: Appointment[];
  firstRequester: Appointment;
}

class AppointmentService {
  private axios_instance: AxiosInstance;

  constructor(endpoint: string = "/appointments", config?: AxiosRequestConfig) {
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
   * DOCU: Get user's appointments based on their role
   * Triggered: On appointments page load
   * Last Updated Date: October 27, 2025
   * @param {string} access_token - JWT access token
   * @returns {Promise<ResponseData<Appointment[]>>} - List of appointments
   */
  getAppointments = async (
    access_token: string
  ): Promise<ResponseData<Appointment[]>> => {
    const res = await this.axios_instance.get<ResponseData<Appointment[]>>(
      "/",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    return res.data;
  };

  /**
   * DOCU: Get a single appointment by ID
   * Triggered: On appointment detail page
   * Last Updated Date: October 27, 2025
   * @param {number} id - Appointment ID
   * @param {string} access_token - JWT access token
   * @returns {Promise<ResponseData<Appointment>>} - Appointment details
   */
  getAppointmentById = async (
    id: number,
    access_token: string
  ): Promise<ResponseData<Appointment>> => {
    const res = await this.axios_instance.get<ResponseData<Appointment>>(
      `/${id}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    return res.data;
  };

  /**
   * DOCU: Create a new appointment
   * Triggered: On appointment booking
   * Last Updated Date: October 27, 2025
   * @param {Object} data - Appointment data
   * @param {string} access_token - JWT access token
   * @returns {Promise<ResponseData<Appointment>>} - Created appointment
   */
  createAppointment = async (
    data: {
      doctorId: number;
      date: string;
      startTime: string;
      endTime: string;
      reason?: string;
    },
    access_token: string
  ): Promise<ResponseData<Appointment>> => {
    const res = await this.axios_instance.post<ResponseData<Appointment>>(
      "/",
      data,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    return res.data;
  };

  /**
   * DOCU: Update an existing appointment
   * Triggered: On appointment reschedule
   * Last Updated Date: October 27, 2025
   * @param {number} id - Appointment ID
   * @param {Object} data - Updated appointment data
   * @param {string} access_token - JWT access token
   * @returns {Promise<ResponseData<Appointment>>} - Updated appointment
   */
  updateAppointment = async (
    id: number,
    data: Partial<{
      date: string;
      startTime: string;
      endTime: string;
      reason: string;
      status: "pending" | "confirmed" | "arrived" | "completed" | "cancelled";
    }>,
    access_token: string
  ): Promise<ResponseData<Appointment>> => {
    const res = await this.axios_instance.patch<ResponseData<Appointment>>(
      `/${id}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    return res.data;
  };

  /**
   * DOCU: Cancel an appointment
   * Triggered: On appointment cancellation
   * Last Updated Date: October 27, 2025
   * @param {number} id - Appointment ID
   * @param {string} access_token - JWT access token
   * @returns {Promise<ResponseData<null>>} - Success status
   */
  cancelAppointment = async (
    id: number,
    access_token: string
  ): Promise<ResponseData<null>> => {
    const res = await this.axios_instance.delete<ResponseData<null>>(`/${id}`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    return res.data;
  };

  /**
   * DOCU: Get conflicting appointments (for doctors)
   * Triggered: On doctor appointments page load
   * Last Updated Date: October 27, 2025
   * @param {string} access_token - JWT access token
   * @returns {Promise<ResponseData<ConflictingSlot[]>>} - List of conflicting slots
   */
  getConflicts = async (
    access_token: string
  ): Promise<ResponseData<ConflictingSlot[]>> => {
    const res = await this.axios_instance.get<ResponseData<ConflictingSlot[]>>(
      "/conflicts",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    return res.data;
  };

  /**
   * DOCU: Request reschedule for an appointment (doctor only)
   * Triggered: When doctor requests patient to reschedule
   * Last Updated Date: October 27, 2025
   * @param {number} id - Appointment ID
   * @param {string} reason - Reason for reschedule request
   * @param {string} proposedDate - Proposed new date
   * @param {string} proposedStartTime - Proposed new start time
   * @param {string} access_token - JWT access token
   * @returns {Promise<ResponseData<Appointment>>} - Updated appointment
   */
  requestReschedule = async (
    id: number,
    reason: string,
    proposedDate: string,
    proposedStartTime: string,
    access_token: string
  ): Promise<ResponseData<Appointment>> => {
    const res = await this.axios_instance.post<ResponseData<Appointment>>(
      `/${id}/request-reschedule`,
      { reason, proposedDate, proposedStartTime },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    return res.data;
  };

  /**
   * DOCU: Confirm reschedule request (patient only)
   * Triggered: When patient confirms the reschedule proposed by doctor
   * Last Updated Date: October 27, 2025
   * @param {number} id - Appointment ID
   * @param {string} access_token - JWT access token
   * @returns {Promise<ResponseData<Appointment>>} - Updated appointment
   */
  confirmReschedule = async (
    id: number,
    access_token: string
  ): Promise<ResponseData<Appointment>> => {
    const res = await this.axios_instance.post<ResponseData<Appointment>>(
      `/${id}/confirm-reschedule`,
      {},
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    return res.data;
  };

  /**
   * DOCU: Cancel appointment with reason
   * Triggered: When patient/doctor cancels an appointment
   * Last Updated Date: October 27, 2025
   * @param {number} id - Appointment ID
   * @param {string} reason - Cancellation reason
   * @param {string} access_token - JWT access token
   * @returns {Promise<ResponseData<Appointment>>} - Cancelled appointment
   */
  cancelWithReason = async (
    id: number,
    reason: string,
    access_token: string
  ): Promise<ResponseData<Appointment>> => {
    const res = await this.axios_instance.delete<ResponseData<Appointment>>(
      `/${id}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
        data: { reason },
      }
    );
    return res.data;
  };
}

export default AppointmentService;
