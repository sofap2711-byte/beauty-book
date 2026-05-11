"use client";

import Nav from "@/components/Nav";
import ServicesAccordion from "@/components/ServicesAccordion";
import { Instagram, ArrowDown } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <Nav />

      {/* Hero */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-slate-900">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-900/60 to-slate-900/90" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-sky-200/80 text-sm tracking-wide mb-6">
            <span>★</span>
            <span>5.0 рейтинг — 200+ отзывов</span>
          </div>

          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-white font-300 leading-[0.95] tracking-tight">
            Beauty
            <br />
            <span className="italic">Book</span>
          </h1>

          <p className="text-slate-300 text-lg md:text-xl mt-6 font-300 tracking-wide">
            Салон красоты премиум-класса
          </p>
          <p className="text-slate-400 text-sm md:text-base mt-3 max-w-md mx-auto leading-relaxed">
            Естественная красота без перегруженности.
            <br />
            Современный подход с деликатным вниманием к деталям.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <a
              href="#services"
              className="px-8 py-3 bg-white text-slate-900 text-sm tracking-wide hover:bg-sky-50 transition-colors"
            >
              Записаться
            </a>
            <a
              href="https://t.me/sofi_sofi_27"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 border border-slate-600 text-white text-sm tracking-wide hover:bg-white/10 transition-colors"
            >
              Консультация
            </a>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-500 animate-bounce">
          <ArrowDown className="w-5 h-5" />
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-24 md:py-32 bg-[#f8f9fa]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
            <div className="order-2 md:order-1">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-4">
                О салоне
              </div>
              <h2 className="font-serif text-4xl md:text-5xl text-slate-900 font-300 leading-tight">
                Место, где
                <br />
                <span className="italic">доверяют</span>
              </h2>
              <p className="text-slate-500 mt-6 leading-relaxed">
                Наша задача — подчеркнуть естественную красоту и сохранить гармонию.
                Мы не делаем «маску», мы работаем с тем, что есть, усиливая ваши лучшие черты.
              </p>
              <p className="text-slate-500 mt-4 leading-relaxed">
                Профессиональная команда, 8 лет практики, премиальные препараты
                и современное оборудование.
              </p>

              <div className="grid grid-cols-3 gap-6 mt-10 pt-10 border-t border-slate-200">
                <div>
                  <div className="font-serif text-3xl text-slate-900">1000+</div>
                  <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Клиентов</div>
                </div>
                <div>
                  <div className="font-serif text-3xl text-slate-900">8 лет</div>
                  <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Практики</div>
                </div>
                <div>
                  <div className="font-serif text-3xl text-slate-900">95%</div>
                  <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Возвращаются</div>
                </div>
              </div>
            </div>

            <div className="order-1 md:order-2">
              <div className="aspect-[4/5] bg-slate-200 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-300/50 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center text-slate-400 font-serif text-2xl italic">
                  фото салона
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <ServicesAccordion />

      {/* CTA */}
      <section className="relative py-24 md:py-32 bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900" />
        <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
          <h2 className="font-serif text-4xl md:text-5xl text-white font-300">
            Запишитесь на
            <br />
            <span className="italic">удобное время</span>
          </h2>
          <p className="text-slate-400 mt-6">
            Выберите услугу и мастера, а мы подберём идеальное время
          </p>
          <a
            href="#services"
            className="inline-block mt-8 px-8 py-3 bg-white text-slate-900 text-sm tracking-wide hover:bg-sky-50 transition-colors"
          >
            Выбрать услугу
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-[#f8f9fa] border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="font-serif text-2xl text-slate-900 mb-2">
            BeautyBook <span className="italic text-slate-500 text-lg">Aesthetics</span>
          </div>
          <p className="text-sm text-slate-400 mb-6">
            Онлайн-запись в салон красоты премиум-класса
          </p>
          <a
            href="https://instagram.com/beautybook"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm"
          >
            <Instagram className="w-4 h-4" />
            <span>@beautybook</span>
          </a>
          <div className="mt-10 text-xs text-slate-300">
            © {new Date().getFullYear()} BeautyBook. Все права защищены.
          </div>
        </div>
      </footer>
    </div>
  );
}
