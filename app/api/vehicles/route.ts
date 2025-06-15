import { NextRequest, NextResponse } from 'next/server';
import { addVehicleWithLog, getVehicles } from '@/lib/db/queries';

export async function GET() {
  try {
    const vehicles = await getVehicles();
    return NextResponse.json(vehicles);
  } catch (error: any) {
    console.error("GET /api/vehicles error:", error);
    return NextResponse.json(
      { error: "Failed to fetch vehicles" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    console.log("POST /api/vehicles received:", data);

    const result = await addVehicleWithLog({
      ...data,
      registrationExp: new Date(data.registrationExp),
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("POST /api/vehicles error:", error);
    return NextResponse.json(
      { error: error.message || 'Failed to add vehicle' },
      { status: 500 }
    );
  }
}
