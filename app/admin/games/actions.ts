"use server";

import { revalidatePath } from "next/cache";
import { requireLocalAdminAccess } from "@/lib/admin-access";
import {
  deleteAllDailyGamesForAdmin,
  deleteDailyGameForAdmin,
} from "@/lib/admin-games";

export async function deleteDailyGameAction(formData: FormData) {
  await requireLocalAdminAccess();

  const dailyGameId = formData.get("dailyGameId");

  if (typeof dailyGameId !== "string") {
    throw new Error("Missing game id.");
  }

  await deleteDailyGameForAdmin(dailyGameId);
  revalidateGamePaths();
}

export async function deleteAllDailyGamesAction() {
  await requireLocalAdminAccess();

  await deleteAllDailyGamesForAdmin();
  revalidateGamePaths();
}

function revalidateGamePaths() {
  revalidatePath("/admin");
  revalidatePath("/admin/games");
  revalidatePath("/live");
  revalidatePath("/live/[gameId]", "page");
  revalidatePath("/live/[gameId]/[playerId]", "page");
}
