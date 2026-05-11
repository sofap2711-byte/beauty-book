"use client";

import { useParams, notFound } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getServiceById, getMastersByService } from "@/app/actions";
import Nav from "@/components/Nav";
import ConsultationDialog from "@/components/ConsultationDialog";
import { Button } from "@/components/ui/button";
import { Star, Instagram, ArrowLeft, Calendar } from "lucide-react";
import type { Service, Master } from "@prisma/client";

export default function ServicePage() {
  const params = useParams();
  const categoryId = params.id as string;

  const [category, setCategory] = useState<Service | null>(null);
  const [serviceMasters, setServiceMasters] = useState<Master[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getServiceById(categoryId), getMastersByService(categoryId)]).then(
      ([cat, masters]) => {
        setCategory(cat);
        setServiceMasters(masters);
        setLoading(false);
      }
    );
  }, [categoryId]);

  if (!loading && !category) {
    notFound();
  }

  if (loading || !category) {
    return (
      <div className="min-h-screen bg-[#f8f9fa]">
        <Nav />
        <main className="max-w-5xl mx-auto px-6 pt-28 pb-20 text-center text-slate-400 text-sm">
          Загрузка...
        </main>
      </div>
    );
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
            {serviceMasters.length} мастеров
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
                    <h3 className="font-serif text-xl text-slate-900">{master.name}</h3>
                    <a
                      href={master.instagram ? `https://instagram.com/${master.instagram}` : "#"}
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
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-slate-100">
                <ConsultationDialog
                  masterName={master.name}
                  trigger={
                    <Button
                      variant="outline"
                      className="rounded-none border-slate-300 text-slate-700 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all text-sm"
                    >
                      Консультация
                    </Button>
                  }
                />

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
