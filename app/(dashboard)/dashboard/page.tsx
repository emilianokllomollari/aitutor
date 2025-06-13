"use client";

import StatsChart from "./home/components/StatsChart"; // ✅ points to Chart.tsx with ApexChart

export default function HomePage() {
  return (
    <section className="h-full p-4 lg:p-8 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Welcome</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Vehicles"
          amount="405"
          change="+4.75%"
          changeColor="text-green-600"
        />
        <SummaryCard
          title="Monthly Revenue"
          amount="$12,787.00"
          change="+54.02%"
          changeColor="text-red-500"
        />
        <SummaryCard
          title="Available Cars"
          amount="320"
          change="-1.39%"
          changeColor="text-gray-500"
        />
        <SummaryCard
          title="Upcoming Maintenance"
          amount="3"
          change="+10.18%"
          changeColor="text-red-500"
        />
      </div>

      {/* 📊 Chart below the summary cards */}
      <StatsChart />
    </section>
  );
}

function SummaryCard({
  title,
  amount,
  change,
  changeColor,
}: {
  title: string;
  amount: string;
  change: string;
  changeColor: string;
}) {
  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm space-y-2">
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <span>{title}</span>
        <span className={changeColor}>{change}</span>
      </div>
      <div className="text-2xl font-semibold text-gray-900">{amount}</div>
    </div>
  );
}
