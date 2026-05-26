# Архитектура прототипа СОИД

## Стек и обоснование

| Слой | Технология | Обоснование |
|------|------------|-------------|
| Сборка | Vite 8 | Быстрый dev-сервер, простая конфигурация, нативный TS, нет SSR-нагрузки |
| UI-фреймворк | React 19 | Стандарт индустрии, совместим со всем экосистемой shadcn/Lucide |
| Язык | TypeScript (strict) | Безопасность типов, явная типизация API-контрактов через `shared/types` |
| Стили | Tailwind CSS 3 | Utility-first, CSS-переменные привязаны к токенам DS v4.0 |
| Компоненты | shadcn/ui + кастомные | Несложные компоненты делаем сами по спецификации DS (Chip, StatCard, Panel, …) |
| Роутер | React Router 7 | Стандартный data-router с маршрут-объектами |
| Серверный state | TanStack Query 5 | Кеширование, refetch, mutation invalidation; `staleTime: 30s` по умолчанию |
| Локальный state | Zustand | Лёгкий, без boilerplate; темы и auth — через persist middleware (localStorage) |
| Формы | React Hook Form + Zod | Минимум ререндеров, схематичная валидация |
| Графики | Recharts | System health dashboard (PlatformHealthPage) |
| Иконки | Lucide React | Rounded outline, размеры из шкалы DS 12/14/16/18/20/24 |
| Даты | date-fns + ru-RU | Локализованный формат `ДД.ММ.ГГГГ ЧЧ:ММ` |
| Моки | MSW 2 | Перехватывает реальные `fetch`, поддерживает delay и условные ошибки |

## Структура папок

```
src/
├── app/                      Корень React-приложения
│   ├── App.tsx               Корневой компонент (providers + router)
│   ├── providers.tsx         QueryClient, темы
│   ├── router.tsx            Все маршруты приложения
│   └── layouts/
│       ├── AuthLayout.tsx    /login и /forgot-password
│       └── AppLayout.tsx     Header + Sidebar + Outlet
│
├── shared/                   Переиспользуемые модули, не зависят от features
│   ├── ui/                   Кастомные UI-компоненты (Chip, Panel, Button, …)
│   ├── hooks/                useAuth, useTheme, useCurrentRole
│   ├── lib/                  cn, formatDate, formatDateTime
│   ├── api/                  apiFetch + ApiError
│   ├── types/                Все доменные типы (User, Migration, Process, …)
│   ├── config/               routes (все пути в одном месте)
│   └── tokens/               (CSS-переменные в src/index.css)
│
├── features/                 Бизнес-модули по фичам ТЗ
│   ├── auth/
│   ├── dashboard/            + widgets/
│   ├── migration/            new, status, details, logs
│   ├── approvals/            new, my-processes, my-tasks, task, process
│   ├── notifications/        Panel + API
│   ├── users/
│   ├── roles/
│   ├── access/
│   ├── orgstructure/
│   ├── templates/
│   ├── operations/
│   ├── platform/             integrations, health, settings, migration-config
│   ├── escalations/
│   └── profile/              about page
│
└── mocks/                    MSW worker + handlers + JSON-фикстуры
    ├── browser.ts
    ├── handlers/             auth, dashboard, notifications, migration, approvals, admin, platform
    └── fixtures/             все JSON-данные
```

## Поток данных

```
UI компонент
    │
    ▼ useQuery / useMutation
TanStack Query
    │
    ▼ fetch
shared/api/client.ts (apiFetch)
    │
    ▼ HTTP /api/*
MSW handler перехватывает в браузере
    │
    ▼ читает данные из fixtures
JSON-фикстура
```

**Замена на реальный бэкенд:**

1. Удалить `await worker.start(...)` из `src/main.tsx` (или обернуть в `if (import.meta.env.DEV)`).
2. Поменять `API_BASE` в `shared/api/client.ts` на адрес продакшен-API.
3. Удалить папку `src/mocks/` после согласования с командой.

## Стратегия именования API

Все эндпоинты под `/api/` префиксом. Конвенция:

- `GET /api/<resource>` — список с фильтрами через query-параметры
- `GET /api/<resource>/:id` — один объект
- `POST /api/<resource>` — создание
- `PATCH /api/<resource>/:id` — частичное обновление
- `DELETE /api/<resource>/:id` — удаление
- `POST /api/<resource>/:id/<action>` — действие над объектом (`/decide`, `/test`, `/resolve`, `/read`)

## TanStack Query keys

| Ключ | Что |
|------|-----|
| `['dashboard', role]` | Сводка дашборда по роли |
| `['notifications']` | Уведомления (refetch каждые 60 с) |
| `['migrations', filter]` | Список миграций с фильтрами |
| `['migration', id]` | Детали одного пакета миграции |
| `['migration-logs', id]` | Логи миграции |
| `['external-systems']` | Каталог внешних систем |
| `['approval-templates']` | Шаблоны (опубликованные) |
| `['processes', 'my', filter]` | Мои процессы |
| `['process', id]` | Карточка процесса |
| `['tasks', 'my', filter]` | Мои задачи |
| `['task', id]` | Карточка задачи |
| `['users', filter]` | Пользователи (фильтры в scope админа) |
| `['orgstructure']` | Дерево подразделений |
| `['roles']` | Роли |
| `['operations', filter]` | Журнал |
| `['integrations']` | Подключения PLM (суперадмин) |
| `['migration-config']` | Пары миграции (суперадмин) |
| `['health']` | System health (refetch 30 с) |
| `['escalations']` | Заявки эскалации |
| `['admin-templates']` | Шаблоны для админ-просмотра |

## Имитация ролей в демо

В моковой системе три пользователя (см. `src/mocks/fixtures/users.json`):
- `operator@soid.demo` — оператор (МКЦ)
- `admin@soid.demo` — администратор (Отдел внедрения, scope = ou-implementation)
- `superadmin@soid.demo` — суперадмин (ИТ-инфраструктура, без scope)

На странице `/login` есть три кнопки-shortcut «Войти как …». В реальной версии они убираются. `useCurrentRole()` определяет роль из `currentUser.roles` (priority: superadmin > admin > operator) и используется в:
- `AppLayout` — фильтрация пунктов сайдбара через `roles` в `NAV`;
- `DashboardPage` — выбор набора виджетов;
- `QuickActionsWidget` — набор быстрых действий.

## Темы

Тема (`light`/`dark`) хранится в Zustand с `persist` (localStorage), применяется через класс `dark` на `<html>`. CSS-переменные в `src/index.css` переопределяются под обе темы. Палитра — из WorkForce DS v4.0 с заменой акцентного зелёного на синий enterprise.

## Безопасность и сессии (в моках)

- Токен возвращается `auth/login` и хранится в `Zustand`+`persist`.
- Все аутентифицированные запросы должны передавать `Authorization: Bearer mock-token-<userId>` — в текущем прототипе `apiFetch` его не добавляет автоматически, но `auth/me` это уже использует.
- В продакшене токен должен жить в httpOnly cookie + CSRF-токен.

## Не реализовано в MVP (см. README#known-limitations)

- Реальная криптография, SMTP, AD/LDAP.
- Drag&drop конструктор дашборда (зафиксированный макет по роли).
- Стриминг логов миграции (показываем статичный лог).
- 4-eyes — только UI-визуал «ожидает подтверждения».
- E2E-тесты (только smoke вручную).
- Скриншоты в `screenshots/` — папка создана, заполнение требует ручного запуска браузера.
