"use client";

import { MoreVertical } from "lucide-react";
import { Card } from "@/components/ui/card";

type Vehicle = {
  brand: string;
  model: string;
  year: number;
  plate: string;
  registrationExp: string;
  engineType: string;
  fuelType: string;
  gearbox: string;
  seats: number;
  kilometers: number;
};

type VehicleTableProps = {
  vehicles: Vehicle[];
};

export default function VehicleTable({ vehicles }: VehicleTableProps) {
  return (
    <Card className="p-0 overflow-hidden">
      <div className="w-full overflow-x-auto">
        <table className="min-w-full table-fixed text-sm text-left text-gray-600">
          <thead className="bg-gray-100 text-xs uppercase text-gray-700">
            <tr>
              {[
                "Brand",
                "Model",
                "Year",
                "Plate",
                "Registration Exp.",
                "Engine",
                "Fuel Type",
                "Gearbox",
                "Seats",
                "Kilometers",
                "Actions",
              ].map((heading, i) => (
                <th
                  key={i}
                  className={`px-2 py-3 whitespace-nowrap overflow-hidden text-ellipsis ${
                    heading === "Actions" ? "text-right" : ""
                  }`}
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v, i) => (
              <tr key={i} className="border-b hover:bg-gray-50">
                <td className="px-2 py-3 whitespace-nowrap overflow-hidden text-ellipsis">
                  {v.brand}
                </td>
                <td className="px-2 py-3 whitespace-nowrap overflow-hidden text-ellipsis">
                  {v.model}
                </td>
                <td className="px-2 py-3 whitespace-nowrap">{v.year}</td>
                <td className="px-2 py-3 whitespace-nowrap">{v.plate}</td>
                <td className="px-2 py-3 whitespace-nowrap">
                  {v.registrationExp}
                </td>
                <td className="px-2 py-3 whitespace-nowrap overflow-hidden text-ellipsis">
                  {v.engineType}
                </td>
                <td className="px-2 py-3 whitespace-nowrap">{v.fuelType}</td>
                <td className="px-2 py-3 whitespace-nowrap">{v.gearbox}</td>
                <td className="px-2 py-3 whitespace-nowrap">{v.seats}</td>
                <td className="px-2 py-3 whitespace-nowrap">
                  {v.kilometers.toLocaleString()}
                </td>
                <td className="px-2 py-3 text-right whitespace-nowrap">
                  <button className="p-2 rounded-full hover:bg-gray-200">
                    <MoreVertical className="h-4 w-4 text-gray-600" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
