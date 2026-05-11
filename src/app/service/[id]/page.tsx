"use client";

import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import {
  getServiceById,
  getMastersByServiceId,
} from "@/lib/data";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Star, Instagram, MessageCircle, ArrowLeft, Calendar } from "lucide-react";

export default function ServicePage() {
  const params = useParams();
  const serviceId = params.id as string;
  const service = getServiceById(serviceId);
  const serviceMasters = getMastersByServiceId(serviceId);

  if (!service) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-6 md:py-10">
        <Link
          href="/"
          className="inline-flex items-center text-slate-500 hover:text-slate-800 transition-colors mb-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Назад
        </Link>

        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
          {service.name}
        </h1>
        <p className="text-slate-500 mb-8">
          от {service.priceFrom.toLocaleString("ru-RU")}₽
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {serviceMasters.map((master) => (
            <Card
              key={master.id}
              className="rounded-2xl border-0 shadow-lg bg-white hover:shadow-xl transition-shadow duration-300"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start gap-4">
                  {/* Avatar placeholder */}
                  <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-xl font-bold shrink-0">
                    {master.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-slate-900 truncate">
                        {master.name}
                      </h3>
                      <a
                        href={`https://instagram.com/${master.instagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-pink-500 transition-colors"
                        aria-label="Instagram"
                      >
                        <Instagram className="w-5 h-5" />
                      </a>
                    </div>
                    <p className="text-slate-500 text-sm mb-2">{master.role}</p>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: master.rating }).map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 fill-amber-400 text-amber-400"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 flex flex-wrap gap-3">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="rounded-full border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Консультация
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="rounded-2xl bg-white border-0 shadow-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-slate-900 text-lg">
                        Связаться с {master.name}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-3 mt-2">
                      <a
                        href="https://max.ru"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 text-white">
                          MAX
                        </Button>
                      </a>
                      <a
                        href="https://t.me/username"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button className="w-full rounded-xl bg-sky-400 hover:bg-sky-500 text-white">
                          Telegram
                        </Button>
                      </a>
                    </div>
                  </DialogContent>
                </Dialog>

                <Link href={`/master/${master.id}/book`}>
                  <Button className="rounded-full bg-sky-400 hover:bg-sky-500 text-white shadow-md shadow-sky-400/20 transition-all hover:scale-105 active:scale-95">
                    <Calendar className="w-4 h-4 mr-2" />
                    Записаться
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
