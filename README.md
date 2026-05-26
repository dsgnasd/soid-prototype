# СОИД · Прототип

Демо-прототип веб-интерфейса **Системы обработки инженерных данных (СОИД)**. Реализует ИА и сценарии из артефактов UX-фазы ([01_UX_audit_and_IA.md](../01_UX_audit_and_IA.md), [02–04](../02_UX_scenarios_operator.md)), работает на моках (без реального бэкенда).

## Стек

- **Vite 8** + **React 19** + **TypeScript** (strict)
- **Tailwind CSS 3** + **shadcn/ui** + **Lucide Icons** + **Inter Tight**
- **React Router 7** — навигация
- **TanStack Query 5** — серверное состояние
- **Zustand** — клиентское состояние (тема, auth)
- **React Hook Form + Zod** — формы и валидация
- **Recharts** — графики (system health)
- **MSW 2** — мок HTTP API
- **date-fns** — даты (локаль ru-RU)

## Запуск

```bash
pnpm install
pnpm dev
```

Откройте http://localhost:5173/. В консоли браузера должна появиться строка `[MSW] Mocking enabled`.

На странице входа доступны три демо-shortcut:

- **Войти как Оператор** — Иванов И.И., scope: МКЦ
- **Войти как Администратор** — Петров П.П., scope: Отдел внедрения
- **Войти как Суперадминистратор** — Кузнецова О.А., без scope

Переключатель темы (день/ночь) — в шапке справа.

## Архитектура

```
src/
├── app/                  Root: providers, router, layouts (AuthLayout, AppLayout)
├── shared/               Кросс-фичные элементы
│   ├── ui/               shadcn компоненты + кастомные обёртки (Chip, Badge, StatCard, Panel)
│   ├── hooks/            useAuth, useTheme, useCurrentRole, …
│   ├── lib/              cn, formatDate, …
│   ├── api/              fetcher (apiFetch + ApiError)
│   ├── types/            Domain types (User, Migration, Process, …)
│   ├── config/           routes (все пути в одном месте)
│   └── tokens/           CSS-переменные DS v4.0 с синим enterprise-акцентом
├── features/             Бизнес-модули по сценариям (auth, dashboard, migration, approvals, …)
├── mocks/                MSW worker + handlers + JSON-фикстуры
└── pages/                Тонкие route-components (опционально)
```

## Дизайн-токены

Адаптация **WorkForce Design System v4.0** под СОИД. Изменён только акцент:

- **Light:** `--accent: #2563EB` (синий-600, 4.55:1 на белом — WCAG AA✓)
- **Dark:** `--accent: #3B82F6` (синий-500, 5.69:1 на bg-surface — WCAG AA✓)

Всё остальное (нейтральные тексты/фоны, success/warning/error/info, шкалы радиусов и теней, типографика Inter Tight) — без изменений.

Полное описание токенов и контрастов — в [docs/design-tokens.md](docs/design-tokens.md).

Архитектурное описание — в [docs/architecture.md](docs/architecture.md).

## Состояние реализации

| День | Скоуп | Статус |
|------|-------|--------|
| 0 | Bootstrap (Vite + Tailwind + shadcn + MSW + tokens + лэйауты + auth shell) | ✅ Готово |
| 1–2 | Auth + Dashboard оператора (3 роли) + центр уведомлений + тема | ✅ Готово |
| 3–4 | Миграция: запуск (wizard), статус (фильтры/пагинация), детали, логи | ✅ Готово |
| 5–6 | Согласование (оператор): запуск (степпер), мои процессы, задачи, карточка задачи + действия | ✅ Готово |
| 7 | Админ: пользователи, оргструктура (дерево) | ✅ Готово |
| 8 | Админ: роли (матрица прав), доступы (итог. разрешения), шаблоны, журнал | ✅ Готово |
| 9 | Суперадмин: интеграции (тест), health (графики Recharts), settings (вкладки), эскалации | ✅ Готово |
| 10 | About-страница, docs/architecture.md, docs/design-tokens.md, README | ✅ Готово |

Полный план — в [`/Users/pavelbendin/.claude/plans/iridescent-coalescing-badger.md`](../../../.claude/plans/iridescent-coalescing-badger.md).

## Реализованные экраны

**Сквозные:** `/login`, `/forgot-password`, `/` (дашборд по роли с виджетами), Header с центром уведомлений и переключателем темы, Sidebar по роли.

**Оператор:** `/migration/new` (2-шаговый wizard), `/migration/status` (таблица с фильтрами + пагинация), `/migration/status/:id` (детали с ошибками), `/migration/status/:id/logs` (фильтруемый лог), `/approvals/new` (3-шаговый степпер), `/processes/my` (таблица с вкладками), `/tasks` (группировка по сроку), `/tasks/:id` (действия approve/reject/return), `/processes/:id` (read-only с историей).

**Администратор:** `/admin/users` (CRUD-shell), `/admin/orgstructure` (раскрываемое дерево), `/admin/roles` (матрица прав по разделам), `/admin/access` (назначение + итоговая матрица), `/admin/approval-templates` (карточки шаблонов), `/operations` (журнал с фильтрами).

**Суперадминистратор:** `/platform/integrations` (карточки + тест подключения), `/platform/health` (графики Recharts), `/platform/settings` (4 вкладки: безопасность / SMTP / хранение / лицензия), `/platform/migration-config` (пары источник→цель), `/admin/escalations` (заявки с approve/reject).

## Известные ограничения MVP

- Pixel-perfect Figma-макетов нет — только реализация по DS v4.0.
- Реального бэкенда, AD/LDAP, реальных миграций PLM нет — всё через MSW.
- Без WCAG-автотестов и E2E.
- Без drag&drop конструктора дашборда.
- Стриминг логов миграции — заглушка (статичный список).
- 4-eyes — только UI-визуал статуса «ожидает подтверждения».
- CRUD-операции пользователей/ролей/оргструктуры — UI готов, мутации частично работают через MSW; модалки добавления — заглушки-кнопки.
- Скриншоты ключевых экранов — папка `screenshots/` создана, но не наполнена (требует ручного запуска браузера под каждой ролью).

## Связанные документы

- [../01_UX_audit_and_IA.md](../01_UX_audit_and_IA.md) — UX-аудит ТЗ + новая ИА + ASCII-вайрфреймы
- [../02_UX_scenarios_operator.md](../02_UX_scenarios_operator.md) — сценарии оператора
- [../03_UX_scenarios_admin.md](../03_UX_scenarios_admin.md) — сценарии админа
- [../04_UX_scenarios_superadmin.md](../04_UX_scenarios_superadmin.md) — сценарии суперадмина
- [../directives.md](../directives.md) — WorkForce Design System v4.0
