"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getServices } from "@/app/actions";
import type { Service, SubService } from "@prisma/client";

function SubServiceRow({ sub, serviceId }: { sub: SubService; serviceId: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-5 border-b border-slate-100 last:border-0">
      <div>
        <h4 className="font-serif text-lg text-slate-900">{sub.name}</h4>
        <p className="text-sm text-slate-500 mt-1">{sub.description}</p>
      </div>
      <div className="flex items-center gap-6 shrink-0">
        <span className="text-sm text-slate-400">{sub.price}</span>
        <Link
          href={`/service/${serviceId}`}
          className="text-sm px-5 py-2 border border-slate-300 text-slate-700 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all"
        >
          Выбрать мастера
        </Link>
      </div>
    </div>
  );
}

export default function ServicesAccordion() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [subServicesMap, setSubServicesMap] = useState<Record<string, SubService[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getServices().then((data) => {
      setServices(data);
      const map: Record<string, SubService[]> = {};
      data.forEach((s) => {
        map[s.id] = (s as Service & { subServices: SubService[] }).subServices ?? [];
      });
      setSubServicesMap(map);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <section id="services" className="py-24 md:py-32 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center text-slate-400 text-sm">
          Загрузка услуг...
        </div>
      </section>
    );
  }

  return (
    <section id="services" className="py-24 md:py-32 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-4">Услуги</div>
          <h2 className="font-serif text-4xl md:text-5xl text-slate-900 font-300">
            Премиальные процедуры
          </h2>
          <p className="text-slate-500 mt-4 max-w-lg mx-auto">
            Индивидуальный подбор под ваш тип и задачи
          </p>
        </div>

        <div className="divide-y divide-slate-200">
          {services.map((category) => {
            const isOpen = openId === category.id;
            const subs = subServicesMap[category.id] ?? [];
            return (
              <div key={category.id} className="group">
                <button
                  onClick={() => setOpenId(isOpen ? null : category.id)}
                  className="w-full flex items-center justify-between py-6 text-left transition-colors hover:bg-slate-50/50 px-2 -mx-2"
                >
                  <div className="flex items-baseline gap-4">
                    <h3 className="font-serif text-2xl md:text-3xl text-slate-900 font-300">
                      {category.name}
                    </h3>
                    <span className="text-sm text-slate-400">{subs.length} услуг</span>
                  </div>
                  <ChevronRight
                    className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${
                      isOpen ? "rotate-90" : ""
                    }`}
                  />
                </button>

                <div
                  className={`overflow-hidden transition-all duration-500 ease-out ${
                    isOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="pb-2 pt-2 px-2">
                    <p className="text-sm text-slate-500 mb-4">{category.description}</p>
                    <div>
                      {subs.map((sub) => (
                        <SubServiceRow key={sub.id} sub={sub} serviceId={category.id} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
