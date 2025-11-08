/* PLUGINS */
import APIClient from "@/app/_utils/apiClient";

/* SCHEMA */
import { CreateVisitSchema } from "@/app/_schema/visit.schema";

class VisitService extends APIClient {
  constructor() {
    super("/visits");
  }

  /**
   * DOCU: Creates a visit record with diagnosis and vitals. <br>
   * Triggered: When doctor completes an appointment. <br>
   * Last Updated: October 29, 2025
   */
  createVisit = async (data: CreateVisitSchema) => {
    const response = await this.post<any>("/", data);
    if (!response.status || !response.result) {
      throw response.error || new Error("Failed to create visit");
    }
    return response.result;
  };

  /**
   * DOCU: Fetches visit details by appointment ID. <br>
   * Triggered: When doctor views completed appointment details. <br>
   * Last Updated: October 29, 2025
   */
  getVisitByAppointmentId = async (appointmentId: number) => {
    const response = await this.get<any>(`/appointment/${appointmentId}`);
    if (!response.status) {
      throw response.error || new Error("Failed to fetch visit details");
    }
    return response.result;
  };
}

export default VisitService;
