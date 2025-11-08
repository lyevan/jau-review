"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import axios from "axios";
import { useState } from "react";

interface ExpiringBatch {
  batch_id: number;
  medicine_name: string;
  batch_number: string;
  quantity: number;
  expiry_date: string;
  days_until_expiry: number;
  supplier: string | null;
}

export default function ExpiringBatchesAlert() {
  const { data: session } = useSession();
  const [daysAhead, setDaysAhead] = useState(30);
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: expiringBatches, isLoading } = useQuery({
    queryKey: ["expiring-batches", daysAhead],
    queryFn: async () => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/medicines/expiring-batches`,
        {
          params: { days: daysAhead },
          headers: {
            Authorization: `Bearer ${session!.user.access_token}`,
          },
        }
      );
      return response.data.result as ExpiringBatch[];
    },
    enabled: !!session,
    refetchInterval: 300000, // Refetch every 5 minutes
  });

  if (isLoading) {
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
        <div className="animate-pulse flex items-center gap-3">
          <div className="h-10 w-10 bg-orange-200 rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-orange-200 rounded w-1/4 mb-2"></div>
            <div className="h-3 bg-orange-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!expiringBatches || expiringBatches.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-green-600 text-2xl font-bold">✓</span>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-green-800">All Clear!</h3>
            <p className="text-sm text-green-600">
              No batches expiring in the next {daysAhead} days
            </p>
            {/* Filter Controls */}
            <div className="mt-3 flex items-center gap-2">
              <label className="text-xs text-green-700 font-medium">
                Show batches expiring in:
              </label>
              <select
                value={daysAhead}
                onChange={(e) => setDaysAhead(parseInt(e.target.value))}
                className="text-xs px-2 py-1 border border-green-300 rounded bg-white"
              >
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
                <option value={30}>30 days</option>
                <option value={60}>60 days</option>
                <option value={90}>90 days</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const criticalBatches = expiringBatches.filter(
    (b) => b.days_until_expiry <= 7
  );
  const warningBatches = expiringBatches.filter(
    (b) => b.days_until_expiry > 7 && b.days_until_expiry <= 30
  );

  return (
    <div className="bg-orange-50 border-2 border-orange-300 rounded-xl p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center shrink-0">
          <span className="text-white text-2xl font-bold">!</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-2">
            <h3 className="font-bold text-orange-900 text-lg">
              Expiring Batches Alert
            </h3>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-3 py-1 text-sm bg-orange-200 hover:bg-orange-300 text-orange-800 rounded-lg transition-colors font-medium"
            >
              {isExpanded ? "Hide" : "Show"} Details
            </button>
          </div>

          <div className="flex flex-wrap gap-4 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              <span className="text-sm font-semibold text-red-700">
                {criticalBatches.length} Critical (≤7 days)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
              <span className="text-sm font-semibold text-orange-700">
                {warningBatches.length} Warning (8-30 days)
              </span>
            </div>
          </div>

          {/* Quick Stats */}
          <p className="text-sm text-orange-700">
            Total: <strong>{expiringBatches.length} batches</strong> expiring in
            the next {daysAhead} days
          </p>

          {/* Filter Controls */}
          <div className="mt-3 flex items-center gap-2">
            <label className="text-xs text-orange-700 font-medium">
              Show batches expiring in:
            </label>
            <select
              value={daysAhead}
              onChange={(e) => setDaysAhead(parseInt(e.target.value))}
              className="text-xs px-2 py-1 border border-orange-300 rounded bg-white"
            >
              <option value={7}>7 days</option>
              <option value={14}>14 days</option>
              <option value={30}>30 days</option>
              <option value={60}>60 days</option>
              <option value={90}>90 days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-4 space-y-3 max-h-96 overflow-y-auto">
          {/* Critical Batches */}
          {criticalBatches.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-red-800 mb-2">
                Critical - Action Required
              </h4>
              <div className="space-y-2">
                {criticalBatches.map((batch) => (
                  <div
                    key={batch.batch_id}
                    className="bg-red-50 border border-red-300 rounded-lg p-3"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold text-red-900">
                          {batch.medicine_name}
                        </p>
                        <p className="text-xs text-red-700 mt-1">
                          Batch: {batch.batch_number}
                          {batch.supplier && ` • Supplier: ${batch.supplier}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-red-600">
                          {batch.days_until_expiry}
                        </p>
                        <p className="text-xs text-red-600">
                          day{batch.days_until_expiry !== 1 ? "s" : ""} left
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-red-700">
                        Quantity: {batch.quantity} units
                      </p>
                      <p className="text-xs text-red-700">
                        Expires:{" "}
                        {new Date(batch.expiry_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warning Batches */}
          {warningBatches.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-orange-800 mb-2">
                Warning - Monitor Closely
              </h4>
              <div className="space-y-2">
                {warningBatches.map((batch) => (
                  <div
                    key={batch.batch_id}
                    className="bg-white border border-orange-300 rounded-lg p-3"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold text-orange-900">
                          {batch.medicine_name}
                        </p>
                        <p className="text-xs text-orange-700 mt-1">
                          Batch: {batch.batch_number}
                          {batch.supplier && ` • Supplier: ${batch.supplier}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-orange-600">
                          {batch.days_until_expiry}
                        </p>
                        <p className="text-xs text-orange-600">days left</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-orange-700">
                        Quantity: {batch.quantity} units
                      </p>
                      <p className="text-xs text-orange-700">
                        Expires:{" "}
                        {new Date(batch.expiry_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
