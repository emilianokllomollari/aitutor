"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AddVehicleModal() {
  const [open, setOpen] = useState(false);
  const [vehicle, setVehicle] = useState({
    brand: "",
    model: "",
    year: "",
    plate: "",
    registrationExp: "",
    engine: "",
    fuelType: "",
    gearbox: "",
    seats: "",
    kilometers: "",
    notes: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setVehicle({
      ...vehicle,
      [name]: ["year", "seats", "kilometers", "engine"].includes(name)
        ? Number(value)
        : value,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Saving vehicle:", vehicle);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white">
          + Add
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Vehicle</DialogTitle>
          <DialogDescription>
            Enter details for the new fleet vehicle.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* 2 fields per row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                name="brand"
                value={vehicle.brand}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                name="model"
                value={vehicle.model}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="year">Year</Label>
              <Input
                type="number"
                id="year"
                name="year"
                value={vehicle.year}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="kilometers">Kilometers</Label>
              <Input
                type="number"
                id="kilometers"
                name="kilometers"
                value={vehicle.kilometers}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="plate">Plate</Label>
              <Input
                id="plate"
                name="plate"
                value={vehicle.plate}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="registrationExp">Registration Exp.</Label>
              <Input
                type="date"
                id="registrationExp"
                name="registrationExp"
                value={vehicle.registrationExp}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="engine">Engine (cc)</Label>
              <Input
                type="number"
                id="engine"
                name="engine"
                value={vehicle.engine}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="fuelType">Fuel Type</Label>
              <select
                id="fuelType"
                name="fuelType"
                value={vehicle.fuelType}
                onChange={handleChange}
                required
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
                value={vehicle.gearbox}
                onChange={handleChange}
                required
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
                value={vehicle.seats}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Full-width Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              name="notes"
              value={vehicle.notes}
              onChange={handleChange}
              className="w-full mt-1 border rounded-md p-2 text-sm resize-y min-h-[100px]"
              placeholder="Add any extra notes about the vehicle..."
            />
          </div>

          {/* Buttons on the same row */}
          <div className="flex flex-row justify-end gap-2 pt-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
