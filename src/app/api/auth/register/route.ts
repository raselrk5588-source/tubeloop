import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  try {
    const { name, email, password, bkashNumber } = await req.json();

    if (!name || !email || !password || !bkashNumber) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: "User with this email already exists" }, { status: 400 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    // isApproved defaults to false as per schema
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        bKashNumber: bkashNumber,
      },
    });

    revalidatePath("/admin/users");

    return NextResponse.json({ message: "User registered successfully", user: { id: newUser.id, email: newUser.email } }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
