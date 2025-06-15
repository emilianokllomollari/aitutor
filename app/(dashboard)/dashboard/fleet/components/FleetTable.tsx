import { useState } from "react";
import { MoreVertical, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

type VehicleTableProps = {
  vehicles: Vehicle[];
  loading?: boolean;
  onEdit: (vehicle: Vehicle) => void;
  onDelete?: (vehicleId: number) => void;
};

export default function VehicleTable({
  vehicles,
  loading = false,
  onEdit,
  onDelete,
}: VehicleTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<Vehicle | null>(null);
  const [confirmPlate, setConfirmPlate] = useState("");

  const handleDelete = async () => {
    if (!deleteTarget || confirmPlate !== deleteTarget.plate) return;

    try {
      const res = await fetch(`/api/vehicles/${deleteTarget.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("Failed to delete:", errText);
        return;
      }

      if (onDelete) onDelete(deleteTarget.id);
    } catch (err) {
      console.error("Error deleting vehicle:", err);
    } finally {
      setDeleteTarget(null);
      setConfirmPlate("");
    }
  };

  return (
    <>
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
                  "Engine (cc)",
                  "Fuel",
                  "Gearbox",
                  "Seats",
                  "Kilometers",
                  "Actions",
                ].map((heading, i) => (
                  <th
                    key={i}
                    className={`px-2 py-3 whitespace-nowrap ${
                      heading === "Actions" ? "text-right" : ""
                    }`}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={11} className="text-center py-10">
                    <Loader2 className="h-5 w-5 animate-spin text-gray-500 inline-block mr-2" />
                    Loading vehicles...
                  </td>
                </tr>
              ) : (
                vehicles.map((v) => (
                  <tr key={v.id} className="border-b hover:bg-gray-50">
                    <td className="px-2 py-3">{v.brand || "-"}</td>
                    <td className="px-2 py-3">{v.model || "-"}</td>
                    <td className="px-2 py-3">{v.year ?? "-"}</td>
                    <td className="px-2 py-3">{v.plate || "-"}</td>
                    <td className="px-2 py-3">
                      {v.registrationExp
                        ? new Date(v.registrationExp).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-2 py-3">{v.engine ?? "-"}</td>
                    <td className="px-2 py-3">{v.fuelType || "-"}</td>
                    <td className="px-2 py-3">{v.gearbox || "-"}</td>
                    <td className="px-2 py-3">{v.seats ?? "-"}</td>
                    <td className="px-2 py-3">
                      {v.kilometers !== null
                        ? v.kilometers.toLocaleString()
                        : "-"}
                    </td>
                    <td className="px-2 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-2 rounded-full hover:bg-gray-200">
                            <MoreVertical className="h-4 w-4 text-gray-600" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(v)}>
                            View / Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() => {
                              setDeleteTarget(v);
                              setConfirmPlate(""); // reset input
                            }}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>

          {deleteTarget && (
            <>
              <p className="mb-2">
                To confirm, please type the plate number for:
              </p>
              <p className="font-medium mb-4">
                <strong>
                  {deleteTarget.brand} {deleteTarget.model}
                </strong>{" "}
                — Plate: <strong>{deleteTarget.plate}</strong>
              </p>

              <Input
                placeholder="Enter plate number"
                value={confirmPlate}
                onChange={(e) => setConfirmPlate(e.target.value)}
              />

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                  Cancel
                </Button>
                <Button
                  className="bg-red-600 text-white"
                  onClick={handleDelete}
                  disabled={confirmPlate !== deleteTarget.plate}
                >
                  Delete
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
