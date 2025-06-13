"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // ✅ use the shared card styles

// Dynamic import to prevent SSR issues
const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function StatsChart() {
  const [timeframe, setTimeframe] = useState("Last week");

  const options: ApexOptions = {
    chart: {
      type: "line" as const,
      height: "100%",
      fontFamily: "Inter, sans-serif",
      dropShadow: { enabled: false },
      toolbar: { show: false },
    },
    tooltip: {
      enabled: true,
      x: { show: false },
    },
    dataLabels: { enabled: false },
    stroke: {
      width: 6,
      curve: "smooth",
    },
    grid: {
      show: true,
      strokeDashArray: 4,
      padding: { left: 2, right: 2, top: -26 },
    },
    legend: { show: false },
    xaxis: {
      categories: ["01 Feb", "02 Feb", "03 Feb", "04 Feb", "05 Feb", "06 Feb"],
      labels: {
        style: {
          fontFamily: "Inter, sans-serif",
          cssClass: "text-xs font-normal fill-gray-500 dark:fill-gray-400",
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { show: false },
  };

  const series = [
    {
      name: "Revenue",
      data: [6500, 6418, 6456, 6526, 6356, 6456],
      color: "#22C55E", // green
    },
    {
      name: "Expenses",
      data: [6456, 6356, 6526, 6332, 6418, 6500],
      color: "#EF4444", // red
    },
  ];

  return (
    <Card>
      <CardContent className="pt-4 space-y-4">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div className="grid grid-cols-2 gap-4">
            <MetricBlock label="Revenue" value="$42,300" />
            <MetricBlock label="Expenses" value="$5.40" />
          </div>

          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 hover:text-blue-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
          >
            {[
              "Yesterday",
              "Today",
              "Last 7 days",
              "Last 30 days",
              "Last 90 days",
            ].map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div>
          <ApexChart
            options={options}
            series={series}
            type="line"
            height={300}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function MetricBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <h5 className="inline-flex items-center text-gray-500 dark:text-gray-400 text-sm font-normal mb-2">
        {label}
      </h5>
      <p className="text-gray-900 dark:text-white text-2xl font-bold leading-none">
        {value}
      </p>
    </div>
  );
}
