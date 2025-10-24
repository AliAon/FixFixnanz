// File: app/page.tsx
"use client";

import { useState } from "react";
import AgencyHeader from "../../components/AgencyHeader";
import Navigation from "../../components/Navigation";
import CustomersTable from "../../components/CustomerTable";
import CalendarView from "../../components/CalendarView";
import GraphOverview from "../../components/GraphOverview";
import OffersView from "../../components/OfferView";
import AVVertagView from "../../components/AVVertagView";

export default function AgencyAdvisorPage() {
  const [activeTab, setActiveTab] = useState("Advisors");

  const renderTabContent = () => {
    switch (activeTab) {
      case "Advisors":
        return <CustomersTable />;
      case "Calendar":
        return <CalendarView />;
      case "Graph & Overview":
        return <GraphOverview />;
      case "Offers":
        return <OffersView />;
      case "AV Vertag":
        return <AVVertagView />;
      default:
        return <CustomersTable />;
    }
  };

  return (
    <main className=" px-4 py-6 bg-white">
      <h1 className="text-3xl font-semibold text-[#0a3869] mb-6">
        Agentur - Kunden
      </h1>

      <div className="grid grid-cols-3 xsm:grid-cols-1 gap-4 mb-8">
        <AgencyHeader
          title="GESAMTUMSATZ"
          amount="79,064.00€"
          color="text-[#6C757D]"
          borderColor="border-[#0a3869]"
        />

        <AgencyHeader
          title="BEZAHLT"
          amount="3,400.00€"
          color="text-green-600"
          borderColor="border-[#0a3869]"
        />

        <AgencyHeader
          title="AUSSTEHENDE BETRÄGE"
          amount="75,379.00€"
          color="text-red-500"
          borderColor="border-[#0a3869]"
        />
      </div>

      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {renderTabContent()}
    </main>
  );
}
