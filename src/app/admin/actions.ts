"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAdmin(password: string) {
  const expected = process.env.ADMIN_PASSWORD || "admin123";
  if (password !== expected) {
    return { error: "Неверный пароль" };
  }

  cookies().set("admin", "true", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect("/admin");
}

export async function logoutAdmin() {
  cookies().delete("admin");
  redirect("/admin");
}

export async function isAdmin() {
  return cookies().get("admin")?.value === "true";
}
