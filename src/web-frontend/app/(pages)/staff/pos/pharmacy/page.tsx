"use client";

import { useState } from "react";
import MedicineList from "@/app/(pages)/admin/pos/pharmacy/_components/MedicineList";
import Cart from "@/app/(pages)/admin/pos/pharmacy/_components/Cart";
import Receipt from "@/app/(pages)/admin/pos/pharmacy/_components/Receipt";
import ConfirmationModal from "@/app/(pages)/admin/pos/pharmacy/_components/ConfirmationModal";
import PrescriptionList from "@/app/(pages)/admin/pos/pharmacy/_components/PrescriptionList";
import { toast } from "@/app/_utils/toast";
import { useCreateMedicineSale } from "@/app/_hooks/mutations/usePharmacy";
import { useGetTodaySalesSummary } from "@/app/_hooks/queries/usePharmacy";
import { useFulfillPrescription } from "@/app/_hooks/mutations/usePrescriptions";
import { Pill, FileText } from "lucide-react";

export interface Medicine {
  id: number;
  name: string;
  brandName: string | null;
  genericName: string | null;
  specification: string | null;
  price: number;
  stock: number;
}

export interface CartItem extends Medicine {
  quantity: number;
  prescribedQuantity?: number;
}

export default function POSPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<any>(null);
  const [pendingCheckout, setPendingCheckout] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"manual" | "prescription">(
    "manual"
  );
  const [activePrescriptionId, setActivePrescriptionId] = useState<
    number | null
  >(null);

  const createSale = useCreateMedicineSale();
  const fulfillPrescription = useFulfillPrescription();
  const { data: todaySummary } = useGetTodaySalesSummary();

  const addToCart = (medicine: Medicine) => {
    const existing = cart.find((item) => item.id === medicine.id);

    if (existing) {
      if (existing.quantity >= medicine.stock) {
        toast.warning(
          "Insufficient Stock",
          "Cannot add more than available stock"
        );
        return;
      }
      setCart(
        cart.map((item) =>
          item.id === medicine.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      if (medicine.stock === 0) {
        toast.error("Out of Stock", "This medicine is currently out of stock");
        return;
      }
      setCart([...cart, { ...medicine, quantity: 1 }]);
    }
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity === 0) {
      setCart(cart.filter((item) => item.id !== id));
    } else {
      setCart(
        cart.map((item) => (item.id === id ? { ...item, quantity } : item))
      );
    }
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const handleShowConfirmation = (checkoutData: any) => {
    setPendingCheckout(checkoutData);
    setShowConfirmation(true);
  };

  const handleConfirmCheckout = async () => {
    if (!pendingCheckout) return;

    setShowConfirmation(false);
    await handleCheckout(pendingCheckout);
  };

  const handleCancelCheckout = () => {
    setShowConfirmation(false);
    setPendingCheckout(null);
  };

  const handleCheckout = async (discountInfo: {
    type: "none" | "senior" | "pwd";
    idNumber: string;
    patientName: string;
    cash?: number;
    change?: number;
  }) => {
    if (cart.length === 0) {
      toast.warning("Empty Cart", "Please add items to cart before checkout");
      return;
    }

    try {
      const subtotal = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      let vatExemption = 0;
      let discount = 0;
      let tax = 0;

      if (discountInfo.type === "senior" || discountInfo.type === "pwd") {
        // 12% VAT exemption
        vatExemption = subtotal * 0.12;
        const afterVat = subtotal - vatExemption;
        // 20% discount on VAT-exempt amount
        discount = afterVat * 0.2;
        tax = 0; // VAT exempt
      } else {
        tax = subtotal * 0.12;
      }

      const total = subtotal - vatExemption - discount + tax;

      // Create sale with items
      const items = cart.map((item) => ({
        medicineId: item.id,
        quantity: item.quantity,
        price: item.price,
      }));

      const response = await createSale.mutateAsync({
        items,
        notes:
          discountInfo.type !== "none"
            ? `POS Sale - ${cart.length} item(s) - ${discountInfo.type === "senior" ? "Senior Citizen" : "PWD"} Discount`
            : `POS Sale - ${cart.length} item(s)`,
        discountType: discountInfo.type,
        discountIdNumber: discountInfo.idNumber || undefined,
        discountPatientName: discountInfo.patientName || undefined,
        cash: discountInfo.cash,
        prescriptionId: activePrescriptionId || undefined, // Include if from prescription
      });

      if (!response) {
        throw new Error("Failed to create sale");
      }

      // If sale was from a prescription, fulfill it (this reduces inventory)
      if (activePrescriptionId) {
        try {
          await fulfillPrescription.mutateAsync(activePrescriptionId);
          console.log(`✅ Prescription RX-${activePrescriptionId} fulfilled`);
        } catch (error) {
          console.error("Prescription fulfillment failed:", error);
          toast.warning(
            "Sale Complete",
            "Sale completed but prescription fulfillment failed. Please fulfill manually."
          );
        }
      }

      // Create transaction object for receipt
      const transaction = {
        id: response.id,
        date: new Date().toISOString(),
        items: cart,
        subtotal,
        vatExemption,
        discount,
        tax,
        total,
        cash: discountInfo.cash || 0,
        change: discountInfo.change || 0,
        discountType: discountInfo.type,
        discountIdNumber: discountInfo.idNumber,
        discountPatientName: discountInfo.patientName,
      };

      setLastTransaction(transaction);
      setShowReceipt(true);
      setCart([]);
      setActivePrescriptionId(null); // Clear prescription tracking

      toast.success(
        "Sale Complete",
        `Transaction ${response.id} completed successfully`
      );
    } catch (error: any) {
      toast.error("Checkout Failed", error.message || "Failed to process sale");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        {/* Header with Today's Summary */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-4">Pharmacy Point of Sale</h1>

          {todaySummary && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-600">Today's Sales</p>
                <p className="text-2xl font-bold text-teal-600">
                  ₱{todaySummary.totalRevenue.toFixed(2)}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-600">Transactions</p>
                <p className="text-2xl font-bold">{todaySummary.totalSales}</p>
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("manual")}
            className={`px-6 py-3 font-medium transition-colors flex items-center gap-2 ${
              activeTab === "manual"
                ? "border-b-2 border-teal-600 text-teal-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Pill className="w-4 h-4" />
            Manual Sale
          </button>
          <button
            onClick={() => setActiveTab("prescription")}
            className={`px-6 py-3 font-medium transition-colors flex items-center gap-2 ${
              activeTab === "prescription"
                ? "border-b-2 border-teal-600 text-teal-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <FileText className="w-4 h-4" />
            From Prescription
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Medicine List or Prescription List */}
          <div className="lg:col-span-2">
            {activeTab === "manual" ? (
              <MedicineList onAddToCart={addToCart} />
            ) : (
              <PrescriptionList
                onLoadToCart={(items: CartItem[], prescriptionId: number) => {
                  setCart(items);
                  setActivePrescriptionId(prescriptionId);
                  toast.success(
                    "Loaded to Cart",
                    `${items.length} items loaded from prescription`
                  );
                }}
              />
            )}
          </div>

          {/* Cart */}
          <div className="lg:col-span-1">
            <Cart
              items={cart}
              onUpdateQuantity={updateQuantity}
              onRemove={removeFromCart}
              onCheckout={handleCheckout}
              onShowConfirmation={handleShowConfirmation}
              isProcessing={createSale.isPending}
              prescriptionId={activePrescriptionId}
            />
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && pendingCheckout && (
        <ConfirmationModal
          items={cart}
          subtotal={pendingCheckout.subtotal}
          vatExemption={pendingCheckout.vatExemption}
          discount={pendingCheckout.discount}
          tax={pendingCheckout.tax}
          total={pendingCheckout.total}
          cash={pendingCheckout.cash}
          change={pendingCheckout.change}
          discountType={pendingCheckout.type}
          discountIdNumber={pendingCheckout.idNumber}
          discountPatientName={pendingCheckout.patientName}
          onConfirm={handleConfirmCheckout}
          onCancel={handleCancelCheckout}
        />
      )}

      {/* Receipt Modal */}
      {showReceipt && lastTransaction && (
        <Receipt
          transaction={lastTransaction}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </div>
  );
}
