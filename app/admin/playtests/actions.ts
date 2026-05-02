"use server";

import { revalidatePath } from "next/cache";
import { requireLocalAdminAccess } from "@/lib/admin-access";
import {
  deleteAllPlaytestRuns,
  deletePlaytestRun,
} from "@/lib/playtest-reports";

export async function deletePlaytestRunAction(formData: FormData) {
  await requireLocalAdminAccess();

  const runId = formData.get("runId");

  if (typeof runId !== "string") {
    throw new Error("Missing playtest run id.");
  }

  await deletePlaytestRun(runId);
  revalidatePlaytestPaths();
}

export async function deleteAllPlaytestRunsAction() {
  await requireLocalAdminAccess();

  await deleteAllPlaytestRuns();
  revalidatePlaytestPaths();
}

function revalidatePlaytestPaths() {
  revalidatePath("/admin/playtests");
  revalidatePath("/admin/playtests/[runId]", "page");
}
