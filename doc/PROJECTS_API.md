# 📡 Принцип работы получения и обработки проектов

Документ описывает архитектуру и процесс получения, нормализации и отображения данных о проектах в приложении.

---

## 🏗️ Архитектура

### Компоненты системы

```
┌─────────────────┐
│  ProjectsPage   │  ← UI компонент (React)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   api.ts        │  ← API сервис (TypeScript)
│  getProjects()  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Vite Proxy     │  ← Прокси в dev режиме (/api → https://backend-web-7mkm.onrender.com)
└────────┬────────┘
         │
         ▼
┌────────────────────────────────────────┐
│  Backend API                           │  ← сервис управления рычагами
│  https://backend-web-7mkm.onrender.com │
└────────────────────────────────────────┘
```

### Поток данных

1. **Инициация запроса** → `ProjectsPage` вызывает `getProjects()`
2. **Формирование URL** → Добавление query параметров и trailing slash
3. **HTTP запрос** → Через прокси (dev) или напрямую (production)
4. **Получение ответа** → JSON данные от сервера
5. **Нормализация** → Преобразование в типизированный формат `Project[]`
6. **Отображение** → Рендеринг в grid-панели через `ProjectCard`

---

## 🔄 Процесс получения данных

### 1. Инициализация запроса

**Файл:** `src/pages/ProjectsPage.tsx`

```typescript
const loadProjects = useCallback(async () => {
  setLoading(true);
  setError(null);
  
  const response = await getProjects({
    search: searchQuery || undefined,
    technology: selectedTechnology || undefined,
    limit: REQUEST_LIMIT,
  });
  
  setProjects(response.projects);
  setMeta({ total: response.total, page: response.page, limit: response.limit });
}, [searchQuery, selectedTechnology]);
```

**Особенности:**
- Используется `useCallback` для мемоизации функции
- Debounce 300ms для оптимизации запросов при изменении фильтров
- Автоматическая загрузка при монтировании компонента

### 2. Формирование URL

**Файл:** `src/services/api.ts`

```typescript
export async function getProjects(params?: ProjectsQueryParams): Promise<ProjectsResponse> {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.technology) queryParams.append('technology', params.technology);
  if (params?.search) queryParams.append('search', params.search);
  
  const queryString = queryParams.toString();
  const url = `${API_BASE_URL}/projects/${queryString ? `?${queryString}` : ''}`;
}
```

**Важные детали:**
- **Trailing slash обязателен** (`/projects/`) для избежания редиректа на сервере
- Query параметры добавляются после trailing slash
- `API_BASE_URL` зависит от режима:
  - **Dev:** `/api` (через прокси)
- **Production:** `https://backend-web-7mkm.onrender.com` или значение из `VITE_API_BASE_URL`

### 3. HTTP запрос

```typescript
const response = await fetch(url, {
  method: 'GET',
  mode: 'cors',
  credentials: 'omit',
  // Content-Type не указывается для GET, чтобы избежать preflight
});
```

**Настройки CORS:**
- `mode: 'cors'` - явное указание CORS режима
- `credentials: 'omit'` - не отправлять cookies
- Без `Content-Type` заголовка - GET запросы не требуют preflight

---

## 🔧 Прокси-конфигурация (Dev режим)

**Файл:** `vite.config.ts`

### Назначение

Прокси решает проблему CORS в development режиме, перенаправляя запросы через Vite dev server.

### Конфигурация

```typescript
proxy: {
  '/api': {
    target: 'https://backend-web-7mkm.onrender.com',
    changeOrigin: true,
    secure: false,
    rewrite: (path) => {
      let newPath = path.replace(/^\/api/, '');
      // Добавляем trailing slash для /projects
      if (newPath === '/projects') return '/projects/';
      if (newPath.startsWith('/projects?')) {
        return newPath.replace('/projects?', '/projects/?');
      }
      return newPath;
    },
    configure: (proxy) => {
      // Обработка редиректов - переписываем location header
      proxy.on('proxyRes', (proxyRes) => {
        if ([301, 302, 307, 308].includes(proxyRes.statusCode)) {
          const location = proxyRes.headers.location;
          if (location?.startsWith('/')) {
            proxyRes.headers.location = `/api${location}`;
          }
        }
      });
    },
  },
}
```

### Как это работает

1. Запрос: `http://localhost:3000/api/projects/?limit=50`
2. Прокси переписывает: `https://backend-web-7mkm.onrender.com/projects/?limit=50`
3. Ответ проксирует обратно клиенту
4. CORS ошибки не возникают, т.к. запрос идет с того же origin

---

## 📊 Нормализация данных

### Зачем нужна нормализация?

Backend API может возвращать данные в разных форматах:
- Разные названия полей (`title` vs `name` vs `project_title`)
- Разные структуры ответов (массив vs объект с `projects`/`results`/`data`)
- Относительные пути к изображениям
- Разные форматы технологий (массив vs строка)

### Процесс нормализации

#### Шаг 1: Нормализация ответа API

**Функция:** `normalizeProjectsResponse()`

```typescript
function normalizeProjectsResponse(data: unknown, params?: ProjectsQueryParams): ProjectsResponse {
  // Поддержка разных форматов ответа:
  
  // 1. Прямой массив
  if (Array.isArray(data)) {
    return { projects: data.map(normalizeProject), total: data.length, ... };
  }
  
  // 2. Объект с полем projects
  if (record.projects) { ... }
  
  // 3. Объект с полем results (Django REST Framework)
  if (record.results) { ... }
  
  // 4. Объект с полем data
  if (record.data) { ... }
}
```

#### Шаг 2: Нормализация отдельного проекта

**Функция:** `normalizeProject()`

**Обрабатываемые поля:**

| Поле проекта | Варианты названий в API |
|-------------|------------------------|
| `id` | `id`, `uuid`, `slug`, `pk`, `projectId` |
| `title` | `title`, `name`, `project_title` |
| `description` | `description`, `fullDescription`, `details` |
| `shortDescription` | `shortDescription`, `short_description`, `summary` |
| `previewImage` | `previewImage`, `preview_image`, `preview`, `cover`, `image`, `thumbnail` |
| `images` | `images`, `gallery`, `photos`, `media` |
| `technologies` | `technologies`, `tech_stack`, `stack`, `tags`, `tech` |
| `demoUrl` | `demoUrl`, `demo_url`, `demo`, `link`, `url` |

**Пример:**

```typescript
const project: Project = {
  id: stringOrUndefined(record.id ?? record.uuid ?? record.slug) ?? generateFallbackId(),
  title: stringOrUndefined(record.title ?? record.name) ?? 'Без названия',
  description: stringOrUndefined(record.description) ?? 'Описание будет добавлено позже.',
  previewImage: allImages[0] ?? DEFAULT_PROJECT_IMAGE,
  technologies: collectTechnologies(record.technologies ?? record.tech_stack),
  // ... опциональные поля
};
```

#### Шаг 3: Обработка изображений

**Функция:** `collectImages()`

```typescript
function collectImages(source: unknown): string[] {
  // Поддержка:
  // - Массив строк
  // - Массив объектов с полями: url, image, src, path
  // - Автоматическое разрешение относительных путей
}
```

**Разрешение URL:**

```typescript
function resolveAssetUrl(value: string | undefined): string | undefined {
  if (!value) return undefined;
  
  // Абсолютный URL (http/https) - возвращаем как есть
  if (/^(https?:)?\/\//i.test(value)) return value;
  
  // Относительный путь - добавляем API_BASE_URL
  if (value.startsWith('/')) return `${API_BASE_URL}${value}`;
  return `${API_BASE_URL}/${value}`;
}
```

#### Шаг 4: Обработка технологий

**Функция:** `collectTechnologies()`

```typescript
function collectTechnologies(source: unknown): string[] {
  // Поддержка:
  // - Строка с разделителями: "React, TypeScript, Node.js"
  // - Массив строк: ["React", "TypeScript"]
  // - Массив объектов: [{ name: "React" }, { title: "TypeScript" }]
}
```

#### Шаг 5: Обработка отзывов клиентов

**Функция:** `normalizeClientReview()`

```typescript
function normalizeClientReview(rawReview: unknown): Project['clientReview'] | undefined {
  // Поддержка разных форматов:
  // - name: name, author, client, customer
  // - text: text, comment, body, message
  // - rating: rating, score (число или строка)
}
```

---

## ⚠️ Обработка ошибок

### Стратегия обработки

1. **Retry механизм** - при ошибке CORS пробуется альтернативный URL
2. **Fallback значения** - возвращаются пустые данные вместо ошибки
3. **Логирование** - все ошибки логируются в консоль

### Реализация

```typescript
try {
  const response = await fetch(url, { ... });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  return normalizeProjectsResponse(data, params);
  
} catch (error) {
  console.error('Error fetching projects from:', url, error);
  
  // Retry без trailing slash в dev режиме
  if (error instanceof TypeError && import.meta.env.DEV && url.includes('/projects/')) {
    const urlWithoutSlash = url.replace('/projects/', '/projects');
    try {
      const retryResponse = await fetch(urlWithoutSlash, { ... });
      if (retryResponse.ok) {
        return normalizeProjectsResponse(await retryResponse.json(), params);
      }
    } catch (retryError) {
      console.error('Retry also failed:', retryError);
    }
  }
  
  // Возвращаем пустой ответ вместо ошибки
  return createFallbackProjectsResponse(params);
}
```

### Fallback ответ

```typescript
function createFallbackProjectsResponse(params?: ProjectsQueryParams): ProjectsResponse {
  return {
    projects: [],
    total: 0,
    page: params?.page ?? 1,
    limit: params?.limit ?? DEFAULT_PROJECTS_LIMIT,
  };
}
```

---

## 🎨 Отображение данных

### Компонент ProjectsPage

**Файл:** `src/pages/ProjectsPage.tsx`

#### Состояние компонента

```typescript
const [projects, setProjects] = useState<Project[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [searchQuery, setSearchQuery] = useState('');
const [selectedTechnology, setSelectedTechnology] = useState<string>('');
```

#### Фильтрация на клиенте

```typescript
const filteredProjects = useMemo(() => {
  return projects.filter((project) => {
    const matchesSearch = !searchQuery || 
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTechnology = !selectedTechnology || 
      project.technologies.includes(selectedTechnology);
    
    return matchesSearch && matchesTechnology;
  });
}, [projects, searchQuery, selectedTechnology]);
```

#### Grid-панель

```tsx
<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {filteredProjects.map((project) => (
    <ProjectCard key={project.id} project={project} />
  ))}
</div>
```

### Компонент ProjectCard

**Файл:** `src/components/ProjectCard.tsx`

Отображает:
- Превью изображение
- Название проекта
- Краткое описание
- Технологии (первые 4 + счетчик)
- Отзыв клиента (если есть)
- Ссылки: "Подробнее" и "Демо"

---

## 🔍 Типы данных

### Project

```typescript
interface Project {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  previewImage: string;
  images?: string[];
  technologies: string[];
  demoUrl?: string;
  clientReview?: {
    name: string;
    text: string;
    rating: number;
  };
}
```

### ProjectsResponse

```typescript
interface ProjectsResponse {
  projects: Project[];
  total: number;
  page: number;
  limit: number;
}
```

### ProjectsQueryParams

```typescript
interface ProjectsQueryParams {
  page?: number;
  limit?: number;
  technology?: string;
  search?: string;
}
```

---

## 🚀 Оптимизации

### 1. Debounce для поиска

```typescript
useEffect(() => {
  const timeoutId = setTimeout(() => {
    void loadProjects();
  }, 300); // Задержка 300ms
  
  return () => clearTimeout(timeoutId);
}, [loadProjects]);
```

### 2. Мемоизация фильтрации

```typescript
const filteredProjects = useMemo(() => {
  return projects.filter(...);
}, [projects, searchQuery, selectedTechnology]);
```

### 3. Lazy loading изображений

```tsx
<img
  src={project.previewImage}
  alt={project.title}
  loading="lazy"  // ← Lazy loading
/>
```

### 4. Кэширование запросов

В будущем можно добавить:
- React Query для кэширования
- Service Worker для offline работы
- LocalStorage для сохранения последних данных

---

## 📝 Примеры использования

### Получение всех проектов

```typescript
const response = await getProjects();
console.log(response.projects); // Project[]
console.log(response.total);    // number
```

### С фильтрацией

```typescript
const response = await getProjects({
  technology: 'React',
  search: 'e-commerce',
  limit: 20,
  page: 1,
});
```

### Получение одного проекта

```typescript
const project = await getProject('project-id-123');
if (project) {
  console.log(project.title);
} else {
  console.log('Проект не найден');
}
```

---

## 🐛 Решение проблем

### Проблема: CORS ошибки

**Решение:**
- В dev режиме используйте прокси (`/api`)
- В production настройте CORS на сервере
- Проверьте, что URL содержит trailing slash

### Проблема: Данные не отображаются

**Проверьте:**
1. Консоль браузера на ошибки
2. Network tab - статус ответа API
3. Формат данных от сервера (должен соответствовать одному из поддерживаемых)
4. Логи в консоли (`Error fetching projects from: ...`)

### Проблема: Изображения не загружаются

**Решение:**
- Проверьте `resolveAssetUrl()` - правильно ли разрешаются пути
- Убедитесь, что `API_BASE_URL` корректный
- Проверьте, что сервер отдает изображения с правильными CORS заголовками

---

## 🔗 Связанные файлы

- `src/services/api.ts` - API сервис и нормализация
- `src/pages/ProjectsPage.tsx` - Компонент страницы проектов
- `src/components/ProjectCard.tsx` - Компонент карточки проекта
- `src/types/index.ts` - TypeScript типы
- `vite.config.ts` - Конфигурация прокси

---

**Последнее обновление:** 2024



