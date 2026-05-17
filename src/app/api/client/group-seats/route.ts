import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../lib/auth";
import prisma from "../../../../lib/prisma";

// GET - List client "seats" (group members) for project owner selection
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        role: true,
        groupId: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role !== "client") {
      return NextResponse.json(
        { error: "Only clients can access group seats" },
        { status: 403 },
      );
    }

    if (!user.groupId) {
      return NextResponse.json({
        seats: [{ id: user.id, name: user.name }],
      });
    }

    const seats = await prisma.user.findMany({
      where: {
        groupId: user.groupId,
        role: "client",
      },
      select: {
        id: true,
        name: true,
        username: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      seats: seats.length > 0 ? seats : [{ id: user.id, name: user.name }],
    });
  } catch (error) {
    console.error("Error fetching group seats:", error);
    return NextResponse.json(
      { error: "Failed to fetch group seats" },
      { status: 500 },
    );
  }
}
