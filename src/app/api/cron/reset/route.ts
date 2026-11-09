import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  await prisma.user.updateMany({
    data: {
      lastUploadTime: new Date(Date.now() - 48 * 60 * 60 * 1000)
    }
  });
  return NextResponse.json({ success: true, message: "lastUploadTime reset" });
}
