"use server";

import {
  createMaterial,
  deleteMaterial,
  getMaterials,
} from "@/repositories/materialsRepository";
import { revalidatePath } from "next/cache";

export async function createMaterialAction(
  title: string,
  url: string,
  type: "link" | "pdf" | "image" = "link",
) {
  try {
    // In real app, get mentorId from session
    await createMaterial({
      title,
      url,
      type,
    });
    revalidatePath("/materials");
    return { success: true };
  } catch (error) {
    console.error("Failed to create material:", error);
    return { success: false, error: "자료 생성에 실패했습니다." };
  }
}

export async function getMaterialsAction() {
  try {
    const materials = await getMaterials();
    return { success: true, data: materials };
  } catch (error) {
    console.error("Failed to fetch materials:", error);
    return { success: false, error: "자료 목록을 불러오는데 실패했습니다." };
  }
}

export async function deleteMaterialAction(id: string) {
  try {
    await deleteMaterial(id);
    revalidatePath("/materials");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete material:", error);
    return { success: false, error: "자료 삭제에 실패했습니다." };
  }
}
