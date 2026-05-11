"use client";

import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import { getCategoryById, getMastersByCategoryId } from "@/lib/data";
import Nav from "@/components/Nav";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star, Instagram, MessageCircle, ArrowLeft, Calendar } from "lucide-react";

export default function ServicePage() {
  const params = useParams();
  const categoryId = params.id as string;
  const category = getCategoryById(categoryId);
  const serviceMasters = getMastersByCategoryId(categoryId);

  if (!category) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <Nav />

      <main className="max-w-5xl mx-auto px-6 pt-28 pb-20">
        <Link
          href="/#services"
          className="inline-flex items-center text-slate-400 hover:text-slate-700 transition-colors mb-10 text-sm tracking-wide"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад к услугам
        </Link>

        <div className="mb-12">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-3">
            {category.subServices.length} услуг
          </div>
          <h1 className="font-serif text-4xl md:text-5xl text-slate-900 font-300">
            {category.name}
          </h1>
          <p className="text-slate-500 mt-3 max-w-xl">{category.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {serviceMasters.map((master) => (
            <div
              key={master.id}
              className="bg-white border border-slate-100 p-6 md:p-8 hover:shadow-xl transition-shadow duration-500"
            >
              <div className="flex items-start gap-5">
                <div className="w-20 h-20 bg-slate-200 shrink-0 flex items-center justify-center text-slate-400 font-serif text-2xl">
                  {master.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-serif text-xl text-slate-900">
                      {master.name}
                    </h3>
                    <a
                      href={`https://instagram.com/${master.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-300 hover:text-pink-500 transition-colors"
                      aria-label="Instagram"
                    >
                      <Instagram className="w-4 h-4" />
                    </a>
                  </div>
                  <p className="text-sm text-slate-500">{master.role}</p>
                  <div className="flex items-center gap-0.5 mt-2">
                    {Array.from({ length: master.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-slate-100">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="rounded-none border-slate-300 text-slate-700 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all text-sm"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Консультация
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="rounded-none bg-white border border-slate-200 shadow-2xl max-w-sm">
                    <DialogHeader>
                      <DialogTitle className="font-serif text-slate-900 text-xl">
                        Связаться с {master.name}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-3 mt-4">
                      <a
                        href="https://max.ru"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button className="w-full rounded-none bg-slate-900 hover:bg-slate-800 text-white">
                          MAX
                        </Button>
                      </a>
                      <a
                        href="https://t.me/username"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button className="w-full rounded-none bg-sky-300 hover:bg-sky-400 text-slate-900">
                          Telegram
                        </Button>
                      </a>
                    </div>
                  </DialogContent>
                </Dialog>

                <Link href={`/master/${master.id}/book`}>
                  <Button className="rounded-none bg-slate-900 hover:bg-slate-800 text-white text-sm transition-colors">
                    <Calendar className="w-4 h-4 mr-2" />
                    Записаться
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
