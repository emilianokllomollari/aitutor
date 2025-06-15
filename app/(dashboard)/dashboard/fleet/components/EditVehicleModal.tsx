"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

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
};

type Props = {
  vehicle: Vehicle | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export default function EditVehicleModal({
  vehicle,
  open,
  onClose,
  onSuccess,
}: Props) {
  const [formData, setFormData] = useState<Vehicle | null>(vehicle);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setFormData(vehicle);
    setIsEditing(false);
  }, [vehicle]);

  if (!formData) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) =>
      prev
        ? {
            ...prev,
            [name]: ["year", "seats", "kilometers", "engine"].includes(name)
              ? Number(value)
              : value,
          }
        : null
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData) return;

    // Convert registrationExp to ISO string if it exists
    let registrationExpString: string | null = null;
    if (formData.registrationExp) {
      try {
        if (formData.registrationExp instanceof Date) {
          registrationExpString = formData.registrationExp.toISOString();
        } else if (typeof formData.registrationExp === "string") {
          // Validate the string is a valid date before converting
          const date = new Date(formData.registrationExp);
          if (!isNaN(date.getTime())) {
            registrationExpString = date.toISOString();
          }
        }
      } catch (error) {
        console.error("Invalid date format:", formData.registrationExp);
        // Handle invalid date - you might want to show an error message to user
        return;
      }
    }

    const payload = {
      ...formData,
      registrationExp: registrationExpString,
    };

    try {
      const res = await fetch(`/api/vehicles/${formData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error("Update failed:", err);
        return;
      }

      onSuccess?.();
      setIsEditing(false);
      onClose();
    } catch (error) {
      console.error("Failed to update vehicle:", error);
    }
  };

  // Helper function to format date for input
  const formatDateForInput = (date: string | Date | null): string => {
    if (!date) return "";

    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      if (isNaN(dateObj.getTime())) return "";
      return dateObj.toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>View / Edit Vehicle</DialogTitle>
          <DialogDescription>Edit vehicle details below.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                name="model"
                value={formData.model}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="year">Year</Label>
              <Input
                type="number"
                id="year"
                name="year"
                value={formData.year ?? ""}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="kilometers">Kilometers</Label>
              <Input
                type="number"
                id="kilometers"
                name="kilometers"
                value={formData.kilometers ?? ""}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="plate">Plate</Label>
              <Input
                id="plate"
                name="plate"
                value={formData.plate}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="registrationExp">Registration Exp.</Label>
              <Input
                type="date"
                id="registrationExp"
                name="registrationExp"
                value={formatDateForInput(formData.registrationExp)}
                onChange={(e) =>
                  setFormData((prev) =>
                    prev
                      ? {
                          ...prev,
                          registrationExp: e.target.value
                            ? e.target.value
                            : null,
                        }
                      : null
                  )
                }
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="engine">Engine (cc)</Label>
              <Input
                type="number"
                id="engine"
                name="engine"
                value={formData.engine ?? ""}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="fuelType">Fuel Type</Label>
              <select
                id="fuelType"
                name="fuelType"
                value={formData.fuelType ?? ""}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full mt-1 border rounded-md p-2 text-sm"
              >
                <option value="">Select fuel type</option>
                <option value="Petrol+Gas">Petrol+Gas</option>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Electric">Electric</option>
              </select>
            </div>
            <div>
              <Label htmlFor="gearbox">Gearbox</Label>
              <select
                id="gearbox"
                name="gearbox"
                value={formData.gearbox ?? ""}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full mt-1 border rounded-md p-2 text-sm"
              >
                <option value="">Select gearbox</option>
                <option value="Automatic">Automatic</option>
                <option value="Manual">Manual</option>
              </select>
            </div>
            <div>
              <Label htmlFor="seats">Seats</Label>
              <Input
                type="number"
                id="seats"
                name="seats"
                value={formData.seats ?? ""}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes ?? ""}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full mt-1 border rounded-md p-2 text-sm resize-y min-h-[100px]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            {!isEditing ? (
              <Button
                type="button"
                className="bg-orange-500 hover:bg-orange-600 text-white"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </Button>
            ) : (
              <>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Save Changes
                </Button>
              </>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
