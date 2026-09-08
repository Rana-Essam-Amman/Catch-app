"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function markListingSold(formData: FormData) {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const id = String(formData.get("id") || "");
  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing || listing.userId !== userId) {
    redirect("/my-ads");
  }

  await prisma.listing.update({
    where: { id },
    data: { isSold: true },
  });

  revalidatePath("/my-ads");
  revalidatePath("/");
  revalidatePath("/listings");
  redirect("/my-ads");
}
