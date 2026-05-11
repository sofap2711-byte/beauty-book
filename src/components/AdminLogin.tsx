"use client";

import { useState } from "react";
import { loginAdmin } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const result = await loginAdmin(password);
    if (result?.error) {
      setError(result.error);
    }
    setSubmitting(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-6">
      <div className="w-full max-w-sm bg-white border border-slate-200 p-8">
        <h1 className="font-serif text-3xl text-slate-900 font-300 mb-2">Админ-панель</h1>
        <p className="text-slate-500 text-sm mb-8">Введите пароль для входа</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="text-xs uppercase tracking-wider text-slate-400 mb-2 block">
              Пароль
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="rounded-none border-slate-200 focus:border-sky-300 focus:ring-sky-200"
            />
            {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
          </div>
          <Button
            type="submit"
            disabled={submitting}
            className="rounded-none bg-slate-900 hover:bg-slate-800 text-white transition-colors"
          >
            {submitting ? "Вход..." : "Войти"}
          </Button>
        </form>
      </div>
    </div>
  );
}
