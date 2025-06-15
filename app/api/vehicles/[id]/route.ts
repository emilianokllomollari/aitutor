import { NextRequest, NextResponse } from "next/server";
import { updateVehicleById } from "@/lib/db/queries";
import { deleteVehicleById } from "@/lib/db/queries";

export async function PUT(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = Number(url.pathname.split("/").pop());

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid vehicle ID" },
        { status: 400 }
      );
    }

    const body = await req.json();

    // Safely parse and validate registrationExp
    let registrationExp: string | null = null;
    if (body.registrationExp) {
      try {
        const parsedDate = new Date(body.registrationExp);
        if (isNaN(parsedDate.getTime())) {
          throw new Error("Invalid date");
        }
        // Convert to ISO string for database storage
        registrationExp = parsedDate.toISOString();
      } catch (error) {
        return NextResponse.json(
          { error: "Invalid registrationExp date format" },
          { status: 400 }
        );
      }
    }

    // Prepare the update data
    const updateData = {
      ...body,
      registrationExp,
    };

    // Remove undefined values to avoid database issues
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const updated = await updateVehicleById(id, updateData);

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("PUT /api/vehicles/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update vehicle" },
      { status: 500 }
    );
  }
}


export async function DELETE(req: NextRequest) {
    try {
      const url = new URL(req.url);
      const id = Number(url.pathname.split("/").pop());
  
      if (isNaN(id)) {
        return NextResponse.json(
          { error: "Invalid vehicle ID" },
          { status: 400 }
        );
      }
  
      await deleteVehicleById(id);
  
      return NextResponse.json({ success: true });
    } catch (error: any) {
      console.error("DELETE /api/vehicles/[id] error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to delete vehicle" },
        { status: 500 }
      );
    }
  }