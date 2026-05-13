# BeautyBook — Design System

> Центральное место для агентов: стиль, цвета, шрифты, компоненты.

---

## Шрифты

| Назначение | Шрифт | Вес | Fallback |
|---|---|---|---|
| **Заголовки** (h1–h6, логотип) | Cormorant Garamond | 300, 400, 600 | Georgia, serif |
| **Основной текст** | Inter | 300, 400, 500, 600 | system-ui, sans-serif |

Cormorant используется с `italic` для акцентных слов в заголовках — например, «*Book*», «*доверяют*», «*удобное время*».

Подключение: `src/app/layout.tsx` через `next/font/google`.

---

## Цветовая палитра

### Основные

| Роль | HEX | Tailwind | Где используется |
|---|---|---|---|
| Фон страницы | `#f8f9fa` | `bg-[#f8f9fa]` | body, главная, разделы |
| Фон карточек | `#ffffff` | `bg-white` | карточки, модалки, таблицы |
| Тёмный фон | `#0f172a` | `bg-slate-900` | Hero, Footer, CTA |
| Тёмный градиент | `#1e293b` → `#0f172a` | `from-slate-800 to-slate-900` | фон CTA + Reviews |

### Текст

| Роль | HEX | Tailwind |
|---|---|---|
| Заголовки | `#0f172a` | `text-slate-900` |
| Основной текст | `#334155` | `text-slate-700` |
| Вторичный текст | `#64748b` | `text-slate-500` |
| Приглушённый | `#94a3b8` | `text-slate-400` |
| Текст на тёмном | `#ffffff`, `#cbd5e1` | `text-white`, `text-slate-300` |

### Акценты

| Роль | HEX | Tailwind | Где используется |
|---|---|---|---|
| Голубой акцент | `#38bdf8` | `sky-400` | hover на кнопках, звёзды |
| Голубой светлый | `#bae6fd` | `sky-200` | бейджи, подсветки |
| Бордеры | `#e2e8f0` | `slate-200` | карточки, инпуты, таблицы |
| Разделители | `#f1f5f9` | `slate-100` | лёгкие разделители |
| Успех | `#10b981` | `emerald-500` | статусы «Подтверждена» |
| Ошибка / Отмена | `#ef4444` | `red-500` | «Отменить», статусы |
| Предупреждение | `#f59e0b` | `amber-500` | статусы «Новая» |

### shadcn/ui переменные

Определены в `src/app/globals.css`:

```css
--background: 0 0% 97.6%;
--foreground: 222 47% 11%;
--primary: 200 90% 70%;
--primary-foreground: 222 47% 11%;
--secondary: 210 20% 94%;
--muted: 210 20% 96%;
--muted-foreground: 215 16% 47%;
--destructive: 0 84% 60%;
--border: 214 20% 88%;
--input: 214 20% 88%;
--ring: 200 90% 70%;
--radius: 0.5rem;
```

---

## Стиль / Визуальный язык

### Общее настроение
**Минималистичный премиум** — много воздуха, тонкие шрифты, сдержанная палитра. Нет ярких красок, всё строится на контрасте `slate-900` ↔ белого с небольшими голубыми акцентами.

### Ключевые черты
- **Прямоугольные формы** — почти нет скруглений (`rounded-none` по умолчанию). Кнопки, карточки, модалки — прямоугольные.
- **Тонкие бордеры** — `border-slate-200`, `border-slate-100`
- **Glassmorphism в навигации** — `bg-[#f8f9fa]/80 backdrop-blur-md border-b border-slate-200/40`
- **Крупные заголовки** — H1 на Hero: `text-5xl md:text-7xl lg:text-8xl`, weight 300
- **Uppercase + tracking** для мелких меток: `text-xs uppercase tracking-[0.2em]`
- **Италик** в заголовках для эмоциональных акцентов

### Анимации
- `fade-in-up` — появление снизу вверх (`0.5s ease-out`)
- `animate-bounce` — стрелка скролла в Hero

---

## Компоненты

### shadcn/ui
Установлена базовая библиотека **shadcn/ui v4** (base-ui). Компоненты:
- `Button` — `rounded-none`, `bg-slate-900`, hover `bg-slate-800`
- `Dialog` — `rounded-none`, белый фон, тонкая рамка
- `Input` — `rounded-none`, `border-slate-200`
- `Card` — используется редко

### Lucide React
Иконки из `lucide-react`, тонкие линии:
- Стандартный `strokeWidth` не указан → используется дефолтный (2)
- В мастер-кабинете используется `strokeWidth={1.5}` для тонкого вида

---

## Файлы дизайн-системы

```
src/app/layout.tsx          → подключение шрифтов (Inter, Cormorant Garamond)
src/app/globals.css         → CSS-переменные shadcn, font-family для h1-h6
tailwind.config.ts          → расширение colors (slate, sky), fontFamily
components.json             → конфигурация shadcn/ui
```

---

## Мастер-кабинет (особый стиль)

Страницы `/master/*` используют **тот же** slate-стиль, но с небольшими отличиями:
- Фон `#F0F4F8` на `/master/diary`
- Glass-карточки: `rgba(255,255,255,0.7) + backdrop-blur-md`
- Акценты: `#4F8CFF` (голубой), `#7B61FF` (фиолетовый), `#A5D8FF` (ледяной)
- Иконки Lucide с `strokeWidth: 1.5`
