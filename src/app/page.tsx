"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import Header from "@/components/Header";
import IconByName from "@/components/IconByName";
import { services } from "@/lib/data";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-100">
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        {/* Hero */}
        <section className="text-center mb-12 md:mb-16">
          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4 leading-tight">
            Запишись к лучшим мастерам
          </h1>
          <p className="text-base md:text-lg text-slate-500 mb-8 max-w-xl mx-auto">
            Онлайн-запись в салон красоты за 2 минуты. Выбери услугу, мастера и
            удобное время.
          </p>
          <Link href="#services">
            <Button className="rounded-full bg-sky-400 hover:bg-sky-500 text-white px-8 py-6 text-base shadow-lg shadow-sky-400/20 transition-all hover:scale-105 active:scale-95">
              Выбрать услугу
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </section>

        {/* Services */}
        <section id="services">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-6 text-center md:text-left">
            Услуги
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {services.map((service) => (
              <Card
                key={service.id}
                className="rounded-2xl border-0 shadow-lg bg-white hover:shadow-xl transition-shadow duration-300 group"
              >
                <CardHeader className="pb-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3 group-hover:bg-sky-50 transition-colors">
                    <IconByName
                      name={service.icon}
                      className="w-6 h-6 text-slate-400 group-hover:text-sky-400 transition-colors"
                    />
                  </div>
                  <CardTitle className="text-lg text-slate-900">
                    {service.name}
                  </CardTitle>
                  <CardDescription className="text-slate-500 text-sm">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-900 font-semibold">
                      от {service.priceFrom.toLocaleString("ru-RU")}₽
                    </span>
                    <Link href={`/service/${service.id}`}>
                      <Button
                        variant="outline"
                        className="rounded-full border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                      >
                        Выбрать мастера
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
