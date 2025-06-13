"use client";

import AddVehicleModal from "./components/AddVehicleModal";
import VehicleTable from "./components/FleetTable";

const vehicles = [
  {
    brand: "Toyota",
    model: "Corolla",
    year: 2021,
    plate: "XYZ-123",
    registrationExp: "2025-06-30",
    engineType: "Hybrid",
    fuelType: "Petrol",
    gearbox: "Automatic",
    seats: 5,
    kilometers: 34000,
  },
  {
    brand: "Ford",
    model: "Focus",
    year: 2019,
    plate: "ABC-987",
    registrationExp: "2024-12-15",
    engineType: "Inline-4",
    fuelType: "Diesel",
    gearbox: "Manual",
    seats: 5,
    kilometers: 58500,
  },
];

export default function FleetPage() {
  return (
    <section className="flex-1 p-4 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg lg:text-2xl font-medium text-gray-900">Fleet</h1>
        <AddVehicleModal />
      </div>
      <VehicleTable vehicles={vehicles} />
    </section>
  );
}
