"use client";

import { useEffect, useState } from "react";
import AddVehicleModal from "@/app/(dashboard)/dashboard/fleet/components/AddVehicleModal";
import EditVehicleModal from "@/app/(dashboard)/dashboard/fleet/components/EditVehicleModal";
import VehicleTable from "@/app/(dashboard)/dashboard/fleet/components/FleetTable";

type Vehicle = {
  id: number;
  brand: string;
  model: string;
  year: number;
  plate: string;
  registrationExp: string | Date | null;
  engine: number | null;
  fuelType: string | null;
  gearbox: string | null;
  seats: number | null;
  kilometers: number | null;
  notes: string | null;
  createdAt: string | Date;
};

export default function FleetPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/vehicles");
      const data = await res.json();
      setVehicles(data);
    } catch (error) {
      console.error("Failed to fetch vehicles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  return (
    <section className="flex-1 p-4 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg lg:text-2xl font-medium text-gray-900">Fleet</h1>
        <AddVehicleModal onSuccess={fetchVehicles} />
      </div>

      <VehicleTable
        vehicles={vehicles}
        loading={loading}
        onEdit={(vehicle) => {
          setSelectedVehicle(vehicle);
          setEditOpen(true);
        }}
        onDelete={fetchVehicles} // <-- use server-refetch on delete
      />

      <EditVehicleModal
        vehicle={selectedVehicle}
        open={editOpen}
        onClose={() => {
          setEditOpen(false);
          setSelectedVehicle(null);
        }}
        onSuccess={fetchVehicles}
      />
    </section>
  );
}
