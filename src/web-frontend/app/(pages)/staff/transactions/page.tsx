"use client";

import { useState, useMemo } from "react";
import TransactionFilters from "@/app/(pages)/admin/transactions/_components/TransactionFilters";
import TransactionTable from "@/app/(pages)/admin/transactions/_components/TransactionTable";
import TransactionDetails from "@/app/(pages)/admin/transactions/_components/TransactionDetails";
import { useGetTransactions } from "@/app/_hooks/queries/useTransactions";
import { Transaction as BackendTransaction } from "@/app/_services/transaction.service";

export type TransactionType = "all" | "pharmacy" | "clinic";

export interface BaseTransaction {
  id: string;
  date: string;
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  cashier: string;
  cash?: number;
  change?: number;
  discountType?: string | null;
  discountIdNumber?: string | null;
  discountPatientName?: string | null;
}

export interface PharmacyTransaction extends BaseTransaction {
  type: "pharmacy";
  items: Array<{
    id: string;
    name: string;
    brandName: string | null;
    genericName: string | null;
    quantity: number;
    price: number;
  }>;
}

export interface ClinicTransaction extends BaseTransaction {
  type: "clinic";
  patient: {
    id: string;
    name: string;
    age: number;
    gender: string;
    contact: string;
  };
  consultationFee: number;
  doctor: string;
  diagnosis?: string;
}

export type Transaction = PharmacyTransaction | ClinicTransaction;

export default function TransactionsPage() {
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  // Fetch all transactions from backend
  const { data: backendTransactions, isLoading } = useGetTransactions();

  // Transform backend transactions to frontend format
  const transactions = useMemo(() => {
    if (!backendTransactions) return [];

    return backendTransactions.map((txn: BackendTransaction): Transaction => {
      if (txn.type === "medicine") {
        // Pharmacy transaction
        const subtotal = parseFloat(txn.subtotal || "0");
        const tax = parseFloat(txn.tax || "0");
        const total = parseFloat(txn.totalAmount);

        return {
          id: txn.transactionId || `PHR-${txn.id}`,
          type: "pharmacy",
          date: new Date(txn.date).toISOString(),
          items:
            txn.items?.map((item) => ({
              id: item.id.toString(),
              name: item.name,
              brandName: item.brandName,
              genericName: item.genericName,
              quantity: item.quantity,
              price: parseFloat(item.price),
            })) || [],
          subtotal,
          tax,
          total,
          cash: txn.cash ? parseFloat(txn.cash) : undefined,
          change: txn.change ? parseFloat(txn.change) : undefined,
          paymentMethod: txn.paymentMethod || "Cash",
          cashier:
            txn.processedByFirstName && txn.processedByLastName
              ? `${txn.processedByFirstName} ${txn.processedByLastName}`
              : txn.processedById
                ? `User ${txn.processedById}`
                : "System",
          discountType: txn.discountType,
          discountIdNumber: txn.discountIdNumber,
          discountPatientName: txn.discountPatientName,
        } as PharmacyTransaction;
      } else {
        // Consultation transaction
        const subtotal = parseFloat(txn.subtotal || "0");
        const tax = parseFloat(txn.tax || "0");
        const total = parseFloat(txn.totalAmount);

        // For walk-in patients, check discountPatientName field
        const patientName =
          txn.patientFirstName && txn.patientLastName
            ? `${txn.patientFirstName} ${txn.patientLastName}`
            : txn.discountPatientName || "Unknown Patient";

        return {
          id: txn.transactionId || `CLN-${txn.id}`,
          type: "clinic",
          date: new Date(txn.date).toISOString(),
          patient: {
            id: txn.patientId?.toString() || "N/A",
            name: patientName,
            age: 0,
            gender: "N/A",
            contact: "N/A",
          },
          consultationFee: subtotal,
          doctor:
            txn.doctorFirstName && txn.doctorLastName
              ? `Dr. ${txn.doctorFirstName} ${txn.doctorLastName}`
              : "N/A",
          diagnosis: txn.description || undefined,
          subtotal,
          tax,
          total,
          cash: txn.cash ? parseFloat(txn.cash) : undefined,
          change: txn.change ? parseFloat(txn.change) : undefined,
          paymentMethod: txn.paymentMethod || "Cash",
          cashier:
            txn.processedByFirstName && txn.processedByLastName
              ? `${txn.processedByFirstName} ${txn.processedByLastName}`
              : txn.processedById
                ? `User ${txn.processedById}`
                : "System",
          discountType: txn.discountType,
          discountIdNumber: txn.discountIdNumber,
          discountPatientName: txn.discountPatientName,
        } as ClinicTransaction;
      }
    });
  }, [backendTransactions]);

  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);

  // Update filtered transactions when transactions change
  useMemo(() => {
    setFilteredTransactions(transactions);
  }, [transactions]);

  const pharmacyTransactions = transactions.filter(
    (t) => t.type === "pharmacy"
  );
  const clinicTransactions = transactions.filter((t) => t.type === "clinic");

  const pharmacyTotal = pharmacyTransactions.reduce(
    (sum, t) => sum + t.total,
    0
  );
  const clinicTotal = clinicTransactions.reduce((sum, t) => sum + t.total, 0);
  const totalRevenue = transactions.reduce((sum, t) => sum + t.total, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">All Transactions</h1>
            <p className="text-gray-600 mt-1">
              View pharmacy and clinic transaction records
            </p>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading transactions...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold">All Transactions</h1>
          <p className="text-gray-600 mt-1">
            View pharmacy and clinic transaction records
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl p-6 shadow-sm text-white">
            <p className="text-white text-opacity-90 text-sm">
              Total Transactions
            </p>
            <p className="text-3xl font-bold mt-2">{transactions.length}</p>
            <p className="text-sm mt-1 text-white text-opacity-80">All time</p>
          </div>

          <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl p-6 shadow-sm text-white">
            <p className="text-white text-opacity-90 text-sm">Medicine Sales</p>
            <p className="text-3xl font-bold mt-2">
              ₱{pharmacyTotal.toFixed(2)}
            </p>
            <p className="text-sm mt-1 text-white text-opacity-80">
              {pharmacyTransactions.length} transactions
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl p-6 shadow-sm text-white">
            <p className="text-white text-opacity-90 text-sm">
              Consultation Revenue
            </p>
            <p className="text-3xl font-bold mt-2">₱{clinicTotal.toFixed(2)}</p>
            <p className="text-sm mt-1 text-white text-opacity-80">
              {clinicTransactions.length} consultations
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-xl p-6 shadow-sm text-white">
            <p className="text-white text-opacity-90 text-sm">Total Revenue</p>
            <p className="text-3xl font-bold mt-2">
              ₱{totalRevenue.toFixed(2)}
            </p>
            <p className="text-sm mt-1 text-white text-opacity-80">Combined</p>
          </div>
        </div>

        {/* Filters */}
        <TransactionFilters
          transactions={transactions}
          onFilterChange={setFilteredTransactions}
        />

        {/* Transaction Table */}
        <TransactionTable
          transactions={filteredTransactions}
          onSelectTransaction={setSelectedTransaction}
        />
      </div>

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <TransactionDetails
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
    </div>
  );
}
