"use client";
import { TabButton } from "@components";
import { useState } from "react";
import IpoWatch from "./@ipoWatch/page";

export default function App() {
  const [activeTab, setActiveTab] = useState<boolean>(false);

  const tabHandler = () => {
    setActiveTab(!activeTab);
  };

  return (
    <>
      <nav className="mb-6">
        <TabButton
          title="IPO Listings"
          tabName="ipo"
          active={true}
          setActiveTab={tabHandler}
        />
      </nav>
      {activeTab && <IpoWatch />}
    </>
  );
}
