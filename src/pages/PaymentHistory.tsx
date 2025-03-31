
import React from 'react';
import DashboardContainer from "@/components/dashboard/layout/DashboardContainer";
import PaymentHistoryPage from "@/components/invoicing/payment/PaymentHistoryPage";
import { useNavigate } from "react-router-dom";

const PaymentHistory = () => {
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate("/invoicing");
  };
  
  return (
    <DashboardContainer>
      <div className="px-4 sm:px-6 py-4 sm:py-6">
        <PaymentHistoryPage onBack={handleBack} />
      </div>
    </DashboardContainer>
  );
};

export default PaymentHistory;
