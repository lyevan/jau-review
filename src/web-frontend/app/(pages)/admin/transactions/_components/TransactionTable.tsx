"use client";

import type { Transaction } from "../page";

interface Props {
  transactions: Transaction[];
  onSelectTransaction: (transaction: Transaction) => void;
}

export default function TransactionTable({
  transactions,
  onSelectTransaction,
}: Props) {
  const getTypeBadge = (type: string) => {
    if (type === "pharmacy") {
      return (
        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
          Medicine
        </span>
      );
    }
    return (
      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
        Consultation
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Transaction ID
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Type
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Date & Time
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Details
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Total
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Staff
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-mono text-sm font-semibold text-teal-600">
                    {transaction.id}
                  </div>
                </td>
                <td className="px-6 py-4">{getTypeBadge(transaction.type)}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(transaction.date).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm">
                  {transaction.type === "pharmacy" ? (
                    <div>
                      <span className="font-medium">
                        {transaction.items.length} item(s)
                      </span>
                      <p className="text-xs text-gray-500">
                        {transaction.items[0]?.name}
                        {transaction.items.length > 1 &&
                          `, +${transaction.items.length - 1} more`}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="font-medium">
                        {transaction.patient.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {transaction.doctor}
                      </div>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className="font-semibold">
                    ₱{transaction.total.toFixed(2)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {transaction.cashier}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => onSelectTransaction(transaction)}
                    className="px-4 py-2 text-teal-600 hover:bg-teal-50 rounded transition-colors text-sm font-medium"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {transactions.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No transactions found
        </div>
      )}
    </div>
  );
}
