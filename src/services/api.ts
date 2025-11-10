import type { Project, ProjectsResponse, ProjectsQueryParams } from '../types';

const DEFAULT_PROJECTS_LIMIT = 12;
const DEFAULT_PROJECT_IMAGE = 'https://placehold.co/600x400?text=Project';
export const PROJECTS_API_ORIGIN = 'https://backend-web-7mkm.onrender.com';
const PROJECTS_API_FALLBACK_BASE_URL = PROJECTS_API_ORIGIN;
// В dev режиме используем прокси через Vite, в production - прямой URL
const API_BASE_URL = import.meta.env.DEV
  ? '/api' // Используем прокси в dev режиме
  : (import.meta.env.VITE_API_BASE_URL || PROJECTS_API_FALLBACK_BASE_URL).replace(/\/+$/, '');

const CLEAN_API_BASE_URL = API_BASE_URL.replace(/\/+$/, '');
const API_BASE_IS_ABSOLUTE = /^(https?:)?\/\//i.test(CLEAN_API_BASE_URL);
const API_BASE_ORIGIN = (() => {
  if (!API_BASE_IS_ABSOLUTE) {
    return undefined;
  }

  const absoluteBase = CLEAN_API_BASE_URL.startsWith('//')
    ? `https:${CLEAN_API_BASE_URL}`
    : CLEAN_API_BASE_URL;

  try {
    return new URL(absoluteBase).origin;
  } catch {
    return undefined;
  }
})();

function stringOrUndefined(value: unknown): string | undefined {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

  return undefined;
}

function numberOrFallback(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

  return fallback;
}

function resolveAssetUrl(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return undefined;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }

  if (trimmed.startsWith('/')) {
    if (API_BASE_ORIGIN) {
      return `${API_BASE_ORIGIN}${trimmed}`;
    }

    const base = CLEAN_API_BASE_URL || '';
    return `${base}${trimmed}`;
  }

  if (API_BASE_ORIGIN) {
    return `${API_BASE_ORIGIN}/${trimmed.replace(/^\/+/, '')}`;
  }

  const base = CLEAN_API_BASE_URL || '';
  const normalizedPath = trimmed.replace(/^\/+/, '');

  if (!base) {
    return `/${normalizedPath}`;
  }

  return `${base}/${normalizedPath}`;
}

function generateFallbackId(): string {
  if (typeof globalThis !== 'undefined' && globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }

  return `project-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeTechnology(value: unknown): string | null {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const candidate =
      stringOrUndefined(record.name) ??
      stringOrUndefined(record.title) ??
      stringOrUndefined(record.label) ??
      stringOrUndefined(record.slug);

    return candidate ?? null;
  }

  return null;
}

function collectTechnologies(source: unknown): string[] {
  const collected: string[] = [];

  if (typeof source === 'string') {
    source
      .split(/[,;]/)
      .map((item) => item.trim())
      .filter(Boolean)
      .forEach((item) => {
        if (!collected.includes(item)) {
          collected.push(item);
        }
      });
  }

  if (!Array.isArray(source)) {
    return collected;
  }

  source.forEach((item) => {
    const tech = normalizeTechnology(item);
    if (tech && !collected.includes(tech)) {
      collected.push(tech);
    }
  });

  return collected;
}

function collectImages(source: unknown): string[] {
  if (!Array.isArray(source)) {
    return [];
  }

  const images: string[] = [];

  source.forEach((item) => {
    if (typeof item === 'string') {
      const resolved = resolveAssetUrl(item.trim());
      if (resolved && !images.includes(resolved)) {
        images.push(resolved);
      }
      return;
    }

    if (item && typeof item === 'object') {
      const record = item as Record<string, unknown>;
      const candidate =
        stringOrUndefined(record.url) ??
        stringOrUndefined(record.image) ??
        stringOrUndefined(record.src) ??
        stringOrUndefined(record.path);

      const resolved = resolveAssetUrl(candidate);
      if (resolved && !images.includes(resolved)) {
        images.push(resolved);
      }
    }
  });

  return images;
}

function normalizeClientReview(rawReview: unknown): Project['clientReview'] | undefined {
  if (!rawReview || typeof rawReview !== 'object') {
    return undefined;
  }

  const review = rawReview as Record<string, unknown>;
  const name =
    stringOrUndefined(review.name) ??
    stringOrUndefined(review.author) ??
    stringOrUndefined(review.client) ??
    stringOrUndefined(review.customer) ??
    '';

  const text =
    stringOrUndefined(review.text) ??
    stringOrUndefined(review.comment) ??
    stringOrUndefined(review.body) ??
    stringOrUndefined(review.message) ??
    '';

  const ratingValue = review.rating ?? review.score;
  const numericRating =
    typeof ratingValue === 'number'
      ? ratingValue
      : typeof ratingValue === 'string'
        ? Number(ratingValue)
        : undefined;
  const rating = typeof numericRating === 'number' && Number.isFinite(numericRating)
    ? numericRating
    : undefined;

  if (!name && !text) {
    return undefined;
  }

  return {
    name,
    text,
    rating: rating ?? 0,
  };
}

function normalizeProject(raw: unknown): Project {
  if (!raw || typeof raw !== 'object') {
    return {
      id: generateFallbackId(),
      title: 'Без названия',
      description: 'Описание будет добавлено позже.',
      previewImage: DEFAULT_PROJECT_IMAGE,
      technologies: [],
    };
  }

  const record = raw as Record<string, unknown>;

  const idCandidate =
    record.id ??
    record.uuid ??
    record.slug ??
    record.pk ??
    record.projectId;

  const id =
    stringOrUndefined(idCandidate) ??
    (typeof idCandidate === 'number' ? idCandidate.toString() : undefined) ??
    generateFallbackId();

  const title =
    stringOrUndefined(record.title) ??
    stringOrUndefined(record.name) ??
    stringOrUndefined(record.project_title) ??
    'Без названия';

  const description =
    stringOrUndefined(record.description) ??
    stringOrUndefined(record.fullDescription) ??
    stringOrUndefined(record.details) ??
    'Описание будет добавлено позже.';

  const shortDescription =
    stringOrUndefined(record.shortDescription) ??
    stringOrUndefined(record.short_description) ??
    stringOrUndefined(record.summary);

  const primaryImageCandidate =
    stringOrUndefined(record.previewImage) ??
    stringOrUndefined(record.preview_image) ??
    stringOrUndefined(record.preview) ??
    stringOrUndefined(record.cover) ??
    stringOrUndefined(record.image) ??
    stringOrUndefined(record.thumbnail);

  const directImages = collectImages(record.images);
  const galleryImages = collectImages(record.gallery);
  const photoImages = collectImages(record.photos);
  const mediaImages = collectImages(record.media);

  const allImages = Array.from(
    new Set(
      [
        resolveAssetUrl(primaryImageCandidate),
        ...directImages,
        ...galleryImages,
        ...photoImages,
        ...mediaImages,
      ].filter((value): value is string => Boolean(value))
    )
  );

  if (allImages.length === 0) {
    allImages.push(DEFAULT_PROJECT_IMAGE);
  }

  const technologies = Array.from(
    new Set([
      ...collectTechnologies(record.technologies),
      ...collectTechnologies(record.tech_stack),
      ...collectTechnologies(record.stack),
      ...collectTechnologies(record.tags),
      ...collectTechnologies(record.tech),
    ])
  );

  const demoUrl =
    stringOrUndefined(record.demoUrl) ??
    stringOrUndefined(record.demo_url) ??
    stringOrUndefined(record.demo) ??
    stringOrUndefined(record.link) ??
    stringOrUndefined(record.url);

  const clientReview = normalizeClientReview(
    record.clientReview ?? record.client_review ?? record.review
  );

  const project: Project = {
    id,
    title,
    description,
    previewImage: allImages[0],
    technologies,
  };

  if (shortDescription) {
    project.shortDescription = shortDescription;
  }
  if (allImages.length > 1) {
    project.images = allImages;
  }
  if (demoUrl) {
    project.demoUrl = demoUrl;
  }
  if (clientReview) {
    project.clientReview = clientReview;
  }

  return project;
}

function createFallbackProjectsResponse(params?: ProjectsQueryParams): ProjectsResponse {
  return {
    projects: [],
    total: 0,
    page: params?.page ?? 1,
    limit: params?.limit ?? DEFAULT_PROJECTS_LIMIT,
  };
}

function normalizeProjectsResponse(
  data: unknown,
  params?: ProjectsQueryParams
): ProjectsResponse {
  const fallback = createFallbackProjectsResponse(params);

  if (!data) {
    return fallback;
  }

  if (Array.isArray(data)) {
    const projects = data.map(normalizeProject);
    return {
      projects,
      total: projects.length,
      page: fallback.page,
      limit: fallback.limit,
    };
  }

  if (typeof data === 'object') {
    const record = data as Record<string, unknown>;

    if (Array.isArray(record.projects)) {
      const projects = record.projects.map(normalizeProject);
      return {
        projects,
        total: numberOrFallback(record.total, projects.length),
        page: numberOrFallback(record.page, fallback.page),
        limit: numberOrFallback(record.limit, fallback.limit),
      };
    }

    if (Array.isArray(record.results)) {
      const projects = record.results.map(normalizeProject);
      return {
        projects,
        total: numberOrFallback(record.count ?? record.total, projects.length),
        page: numberOrFallback(record.page, fallback.page),
        limit: numberOrFallback(record.page_size ?? record.limit, fallback.limit),
      };
    }

    if (Array.isArray(record.data)) {
      const projects = record.data.map(normalizeProject);
      return {
        projects,
        total: numberOrFallback(record.total, projects.length),
        page: numberOrFallback(record.page, fallback.page),
        limit: numberOrFallback(record.limit, fallback.limit),
      };
    }
  }

  return fallback;
}

/**
 * Получить список проектов с фильтрацией и поиском
 */
export async function getProjects(params?: ProjectsQueryParams): Promise<ProjectsResponse> {
  const queryParams = new URLSearchParams();

  if (params?.page) {
    queryParams.append('page', params.page.toString());
  }
  if (params?.limit) {
    queryParams.append('limit', params.limit.toString());
  }
  if (params?.technology) {
    queryParams.append('technology', params.technology);
  }
  if (params?.search) {
    queryParams.append('search', params.search);
  }

  const queryString = queryParams.toString();
  // Используем URL с trailing slash чтобы избежать редиректа на сервере
  const url = `${API_BASE_URL}/projects/${queryString ? `?${queryString}` : ''}`;
  const fallback = createFallbackProjectsResponse(params);

  try {
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit',
      // Убираем Content-Type для GET запроса, чтобы избежать preflight
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return normalizeProjectsResponse(data, params);
  } catch (error) {
    console.error('Error fetching projects from:', url, error);
    // Если ошибка CORS и мы используем прокси, попробуем без trailing slash
    if (error instanceof TypeError && import.meta.env.DEV && url.includes('/projects/')) {
      const urlWithoutSlash = url.replace('/projects/', '/projects');
      try {
        const retryResponse = await fetch(urlWithoutSlash, {
          method: 'GET',
          mode: 'cors',
          credentials: 'omit',
        });
        if (retryResponse.ok) {
          const data = await retryResponse.json();
          return normalizeProjectsResponse(data, params);
        }
      } catch (retryError) {
        console.error('Retry without trailing slash also failed:', retryError);
      }
    }
    return fallback;
  }
}

/**
 * Получить проект по ID
 */
export async function getProject(id: string): Promise<Project | null> {
  // В dev режиме сначала пробуем без trailing slash, чтобы избежать редиректа и CORS
  // В production пробуем с trailing slash
  const urlWithoutSlash = `${API_BASE_URL}/projects/${id}`;
  const urlWithSlash = `${API_BASE_URL}/projects/${id}/`;

  // В dev режиме пробуем сначала без trailing slash
  const urls = import.meta.env.DEV
    ? [urlWithoutSlash, urlWithSlash]
    : [urlWithSlash, urlWithoutSlash];

  for (const url of urls) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        // Если не 404, пробуем следующий URL
        continue;
      }

      const data = await response.json();
      return normalizeProject(data);
    } catch (error) {
      // Если это последняя попытка, логируем ошибку
      if (url === urls[urls.length - 1]) {
        console.error('Error fetching project from all URLs:', error);
      }
      // Пробуем следующий URL
      continue;
    }
  }

  return null;
}


