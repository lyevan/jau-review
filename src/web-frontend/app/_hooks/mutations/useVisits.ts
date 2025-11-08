/* PLUGINS */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

/* SERVICES */
import VisitService from "@/app/_services/visit.service";
import prescriptionService from "@/app/_services/prescription.service";

/* SCHEMA */
import { CreateVisitSchema } from "@/app/_schema/visit.schema";
import { toast } from "@/app/_utils/toast";

const visitService = new VisitService();

/**
 * DOCU: Hook for creating a visit with diagnosis, vitals, and prescriptions <br>
 * Triggered: When doctor completes an appointment <br>
 * Last Updated: October 29, 2025
 */
export const useCreateVisit = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async (data: CreateVisitSchema) => {
      console.log("\n========================================");
      console.log("🏥 useCreateVisit - MUTATION STARTED");
      console.log("========================================");
      console.log("Input data:", JSON.stringify(data, null, 2));
      console.log("Has prescriptions?", !!data.prescriptions);
      console.log("Prescription count:", data.prescriptions?.length || 0);
      console.log("========================================\n");

      // Create the visit first
      const visitResult = await visitService.createVisit(data);

      console.log("\n========================================");
      console.log("✅ Visit created successfully");
      console.log("========================================");
      console.log("Visit ID:", visitResult?.visit?.id);
      console.log("Visit result:", JSON.stringify(visitResult, null, 2));
      console.log("========================================\n");

      // If there are prescriptions, create them
      if (
        data.prescriptions &&
        data.prescriptions.length > 0 &&
        visitResult?.visit?.id
      ) {
        try {
          const prescriptionData = {
            visitId: visitResult.visit.id, // Access visit.id directly
            patientId: data.patientId, // This is patient profile ID
            notes: data.prescriptionNotes,
            items: data.prescriptions,
          };

          console.log("📋 Creating prescription with data:", prescriptionData);

          const prescriptionResult =
            await prescriptionService.createPrescription(
              session!.user.access_token,
              prescriptionData as any
            );

          console.log("\n========================================");
          console.log("✅ Prescription API Result:");
          console.log("========================================");
          console.log(
            "Full result:",
            JSON.stringify(prescriptionResult, null, 2)
          );
          console.log(
            "result.prescription:",
            prescriptionResult.result?.prescription
          );
          console.log("result.items:", prescriptionResult.result?.items);
          console.log(
            "result.availabilityCheck:",
            prescriptionResult.result?.availabilityCheck
          );
          console.log("========================================\n");

          return {
            ...visitResult,
            prescription: prescriptionResult.result,
          };
        } catch (error) {
          console.error("========================================");
          console.error("❌ Failed to create prescription:", error);
          console.error("Error details:", error);
          console.error("========================================");
          toast.warning(
            "Visit Created",
            "Visit was created but prescription creation failed. Please create it manually."
          );
          // Still return the visit result even if prescription failed
          return visitResult;
        }
      }

      return visitResult;
    },
    onSuccess: () => {
      // Invalidate appointments query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
    },
  });
};

/**
 * DOCU: Hook for fetching visit details by appointment ID <br>
 * Triggered: When doctor views completed appointment details <br>
 * Last Updated: October 29, 2025
 */
export const useGetVisitByAppointment = (appointmentId: number | null) => {
  const { data: session } = useSession();
  const accessToken = session?.user?.access_token;

  return useQuery({
    queryKey: ["visit", "appointment", appointmentId],
    queryFn: async () => {
      if (!appointmentId) throw new Error("No appointment ID");
      const result = await visitService.getVisitByAppointmentId(appointmentId);
      return result;
    },
    enabled: !!accessToken && !!appointmentId,
  });
};
