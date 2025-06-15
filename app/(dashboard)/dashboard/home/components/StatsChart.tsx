"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Dynamic import to prevent SSR issues
const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const timeframes = [
  { label: "Today", key: "today" },
  { label: "Yesterday", key: "yesterday" },
  { label: "Last 7 days", key: "7d" },
  { label: "Last 30 days", key: "30d" },
  { label: "Last 90 days", key: "90d" },
];

const chartSeriesMap: Record<string, number[][]> = {
  today: [
    [6400, 6500, 6450, 6580, 6420, 6490],
    [6300, 6370, 6330, 6410, 6280, 6350],
  ],
  yesterday: [
    [6000, 6200, 6100, 6300, 6150, 6250],
    [5900, 6100, 6050, 6150, 6000, 6120],
  ],
  "7d": [
    [6500, 6418, 6456, 6526, 6356, 6456],
    [6456, 6356, 6526, 6332, 6418, 6500],
  ],
  "30d": [
    [5800, 5900, 6000, 6100, 6200, 6300],
    [5400, 5500, 5600, 5700, 5800, 5900],
  ],
  "90d": [
    [5000, 5200, 5400, 5600, 5800, 6000],
    [4500, 4700, 4900, 5100, 5300, 5500],
  ],
};

export default function StatsChart() {
  const [timeframe, setTimeframe] = useState("7d");

  const series = [
    {
      name: "Revenue",
      data: chartSeriesMap[timeframe][0],
      color: "#0ea5e9", // sky-500 (revenue)
    },
    {
      name: "Expenses",
      data: chartSeriesMap[timeframe][1],
      color: "#f97316", // orange-500 (expenses)
    },
  ];

  const options: ApexOptions = {
    chart: {
      type: "line",
      height: "100%",
      fontFamily: "Inter, sans-serif",
      dropShadow: { enabled: false },
      toolbar: { show: false },
    },
    tooltip: { enabled: true, x: { show: false } },
    dataLabels: { enabled: false },
    stroke: { width: 4, curve: "smooth" },
    grid: {
      show: true,
      strokeDashArray: 4,
      padding: { left: 2, right: 2, top: -26 },
    },
    legend: { show: false },
    xaxis: {
      categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
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

  return (
    <Card>
      <CardHeader className="pb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <CardTitle className="text-xl">Stats Overview</CardTitle>
          <p className="text-sm text-muted-foreground">
            Revenue vs Expenses (
            {timeframes.find((t) => t.key === timeframe)?.label})
          </p>
        </div>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            {timeframes.map((tf) => (
              <SelectItem key={tf.key} value={tf.key}>
                {tf.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className="space-y-6 pt-0">
        <div className="grid grid-cols-2 gap-4 sm:gap-8"></div>

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
      <Label className="text-sm text-muted-foreground mb-1 block">
        {label}
      </Label>
      <p className="text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}
