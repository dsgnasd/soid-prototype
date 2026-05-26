# Дизайн-токены прототипа СОИД

База — [WorkForce Design System v4.0](../../directives.md). Изменён только акцент: с зелёного (`#15803D` / `#22C55E`) на синий enterprise. Всё остальное (нейтральные фоны/тексты, семантические success/warning/error/info, шкала отступов, радиусы, тени, типографика Inter Tight) — без изменений.

Все токены определены как CSS-переменные в [`src/index.css`](../src/index.css) и доступны:
1. через Tailwind утилиты (например, `bg-bg-surface`, `text-text-muted`, `border-border-default`) — настроены в [`tailwind.config.ts`](../tailwind.config.ts);
2. напрямую через `var(--name)` в кастомных CSS.

---

## Light theme

### Backgrounds

| Token | HEX | Назначение |
|-------|-----|-----------|
| `--bg-app` | `#F5F6F7` | Фон приложения |
| `--bg-surface` | `#FFFFFF` | Карточки, панели |
| `--bg-subtle` | `#F9FAFB` | Шапки таблиц, вложенные области |
| `--bg-hover` | `#F3F4F6` | Hover-фон |
| `--bg-disabled` | `#F3F4F6` | Disabled-состояние |

### Text

| Token | HEX | Ratio на `#FFF` | WCAG |
|-------|-----|-----------------|------|
| `--text-primary` | `#111827` | 17.74 : 1 | AAA |
| `--text-secondary` | `#4B5563` | 7.56 : 1 | AAA |
| `--text-muted` | `#667085` | **4.97 : 1** | **AA ✓** |
| `--text-disabled` | `#9CA3AF` | 2.54 : 1 | UI-only |
| `--text-inverse` | `#FFFFFF` | — | На accent-фонах |

### Borders

| Token | HEX |
|-------|-----|
| `--border-subtle` | `#EEF0F2` |
| `--border-default` | `#E5E7EB` |
| `--border-strong` | `#D1D5DB` |

### Accent — синий enterprise (замена зелёного DS)

| Token | HEX | Ratio | WCAG |
|-------|-----|-------|------|
| `--accent` | `#2563EB` | 4.55 : 1 на `#FFF` | **AA ✓** |
| `--accent-hover` | `#1D4ED8` | — | — |
| `--accent-pressed` | `#1E40AF` | — | — |
| `--accent-subtle` | `#EFF6FF` | фон акцентных зон | — |
| `--accent-muted` | `#DBEAFE` | альтернативный фон | — |
| `--accent-border` | `#BFDBFE` | граница на accent-subtle | — |
| `--accent-text` | `#1E40AF` | 8.59 : 1 на `--accent-subtle` | **AAA** |
| `#FFFFFF` на `--accent` | — | 4.55 : 1 | **AA ✓** |

### Semantic

| Роль | Main | Background | Text | Ratio (text on bg) |
|------|------|-----------|------|--------------------|
| success | `#15803D` | `#DCFCE7` | `#166534` | 6.49 : 1 |
| warning | `#D97706` | `#FEF3C7` | `#92400E` | 6.37 : 1 |
| error | `#DC2626` | `#FEE2E2` | `#991B1B` | 7.60 : 1 |
| info | `#2563EB` | `#DBEAFE` | `#1E40AF` | 7.15 : 1 |

### Focus

```
--sh-focus: 0 0 0 3px rgba(37, 99, 235, 0.18);
```

---

## Dark theme

### Backgrounds

| Token | HEX |
|-------|-----|
| `--bg-app` | `#0F1115` |
| `--bg-surface` | `#171A20` |
| `--bg-subtle` | `#1C1F26` |
| `--bg-hover` | `#22262E` |
| `--bg-disabled` | `#22262E` |

### Text

| Token | HEX | Ratio на `--bg-surface` | WCAG |
|-------|-----|-------------------------|------|
| `--text-primary` | `#F3F4F6` | 15.84 : 1 | AAA |
| `--text-secondary` | `#C4C9D2` | 10.48 : 1 | AAA |
| `--text-muted` | `#8F95A0` | **5.79 : 1** | **AA ✓** |
| `--text-disabled` | `#4B5057` | — | UI-only |

### Borders

| Token | HEX |
|-------|-----|
| `--border-subtle` | `#22262E` |
| `--border-default` | `#2A2F38` |
| `--border-strong` | `#3A404B` |

### Accent — синий, светлее на тёмном

| Token | HEX | Ratio | WCAG |
|-------|-----|-------|------|
| `--accent` | `#3B82F6` | 5.69 : 1 на `--bg-surface` | **AA ✓** |
| `--accent-hover` | `#60A5FA` | — | — |
| `--accent-pressed` | `#2563EB` | — | — |
| `--accent-text` | `#93C5FD` | 8.5+ : 1 на `--bg-surface` | **AAA** |

### Semantic (dark)

| Роль | Background | Text |
|------|-----------|------|
| success | `rgba(34,197,94,.16)` | `#86EFAC` |
| warning | `rgba(245,158,11,.16)` | `#FCD34D` |
| error | `rgba(239,68,68,.16)` | `#FCA5A5` |
| info | `rgba(59,130,246,.16)` | `#93C5FD` |

### Focus (dark)

```
--sh-focus: 0 0 0 3px rgba(59, 130, 246, 0.28);
```

---

## Типографика

- **Шрифт:** Inter Tight (300, 400, 500, 600, 700) через Google Fonts.
- **Веса:** 400 body / 500 nav-items, кнопки, label / 600 заголовки и stat-values / 700 редко.
- **Цифры:** `font-feature-settings: 'tnum'` — для таблиц и счётчиков (tabular-nums Tailwind utility).
- **Antialiasing:** включён глобально.

---

## Отступы (4px-шкала)

`0 · 2 · 4 · 6 · 8 · 10 · 12 · 16 · 20 · 24 · 28 · 32 · 40 · 48 · 52` — все отступы в проекте через Tailwind utility-классы (`p-4`, `gap-3`, `space-y-5`).

---

## Радиусы

| Token | Значение | Применение |
|-------|----------|-----------|
| `xs` / `rounded-xs` | 4px | Кнопки в bg-чипах, kbd |
| `sm` / `rounded-sm` | 8px | Count Badge, theme-btn |
| `md` / `rounded-md` (default) | **12px** | **Кнопки, инпуты, nav-items** |
| `lg` / `rounded-lg` | 16px | Альт. для кнопок |
| `xl` / `rounded-xl` | **20px** | **Карточки, панели** |
| `2xl` | 24px | Модалки |
| `full` / `rounded-full` | ∞ | Chip, Badge, avatar |

---

## Тени

| Token | Применение |
|-------|-----------|
| `shadow-xs` | Tab active, мелкие элементы |
| `shadow-sm` | Карточки при hover |
| `shadow-md` | Dropdown, popover |
| `shadow-lg` | Модалки |
| `shadow-focus` | Focus-ring (см. `--sh-focus`) |

---

## Иконки

Lucide React. Размеры — только из шкалы:

| Размер | Применение |
|--------|-----------|
| 12px | Chip dot/icon, delta |
| 14px | Кнопки SM, inline-mini |
| 16px | Inline с body |
| 18px | Header actions, mid |
| 20px | Sidebar nav |
| 24px | Крупные иллюстративные |

---

## Правило статусов

**Никогда только цветом.** Каждый статус = `цвет + иконка + текст`.

Все статусы реализованы через компонент [`<Chip>`](../src/shared/ui/chip.tsx) с обязательной иконкой/dot. Производные:
- [`<MigrationStatusChip>`](../src/shared/ui/migration-status-chip.tsx) — статусы миграций (Создан / Обновлён / Ошибка / Частично / В работе / Остановлена)
- [`<ProcessStatusChip>`](../src/shared/ui/process-status-chip.tsx) — статусы процессов согласования (В работе / Согласован / Отклонён / Завершён / Отозван / Черновик)

---

## Чеклист соответствия WorkForce DS v4.0

| Пункт | Статус |
|-------|--------|
| Нет `#000000` | ✓ (минимум `#0F1115`) |
| Нет хардкода hex в JSX | ✓ (только через CSS-переменные или Tailwind) |
| Зелёный не как фон | ✓ (вообще не используется — заменён на синий) |
| Chip = статус, Badge = категория | ✓ |
| Отступы кратны 4px | ✓ (Tailwind utility) |
| Иконки 12/14/16/18/20/24 | ✓ |
| Контрасты ≥ 4.5 : 1 | ✓ (см. таблицы выше) |
| Inter Tight | ✓ |
| Round outline иконки | ✓ (Lucide stroke-linecap round) |
| Focus-ring виден | ✓ (`:focus-visible` глобально) |
| `prefers-reduced-motion` | ✓ |
