import { useState, useEffect, useMemo, useCallback } from 'react';
import { getProjects } from '../services/api';
import ProjectCard from '../components/ProjectCard';
import type { Project } from '../types';

const REQUEST_LIMIT = 50;

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTechnology, setSelectedTechnology] = useState<string>('');
  const [availableTechnologies, setAvailableTechnologies] = useState<string[]>([]);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: REQUEST_LIMIT,
  });

  // Получаем уникальные технологии из всех проектов
  useEffect(() => {
    const technologies = new Set<string>();
    projects.forEach((project) => {
      project.technologies.forEach((tech) => technologies.add(tech));
    });
    setAvailableTechnologies(Array.from(technologies).sort());
  }, [projects]);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getProjects({
        search: searchQuery || undefined,
        technology: selectedTechnology || undefined,
        limit: REQUEST_LIMIT,
      });

      setProjects(response.projects);
      setMeta({
        total: response.total,
        page: response.page,
        limit: response.limit,
      });
    } catch (err) {
      setError('Не удалось загрузить проекты. Попробуйте обновить страницу.');
      console.error('Error loading projects:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedTechnology]);

  // Загрузка проектов с задержкой (debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void loadProjects();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [loadProjects]);

  // Фильтрация проектов на клиенте (если API не поддерживает фильтрацию)
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        !searchQuery ||
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTechnology =
        !selectedTechnology || project.technologies.includes(selectedTechnology);

      return matchesSearch && matchesTechnology;
    });
  }, [projects, searchQuery, selectedTechnology]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedTechnology('');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">
        Проекты
      </h1>

      {/* Блок с фильтрами и поиском */}
      <div className="mb-8 space-y-4">
        {/* Строка поиска */}
        <div className="relative">
          <input
            type="text"
            placeholder="Поиск по названию или описанию..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 pl-10 text-gray-900 placeholder-gray-500 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-400 dark:focus:border-gray-600 dark:focus:ring-gray-600"
          />
          <svg
            className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Фильтры по технологиям */}
        {availableTechnologies.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTechnology('')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                !selectedTechnology
                  ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              Все технологии
            </button>
            {availableTechnologies.map((tech) => (
              <button
                key={tech}
                onClick={() => setSelectedTechnology(tech)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  selectedTechnology === tech
                    ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {tech}
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-600 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 sm:flex-row sm:items-center sm:justify-between">
          <div>
            Найдено{' '}
            <span className="font-semibold text-gray-900 dark:text-white">
              {filteredProjects.length}
            </span>{' '}
            из{' '}
            <span className="font-semibold text-gray-900 dark:text-white">
              {meta.total}
            </span>{' '}
            проектов
            {selectedTechnology && (
              <>
                {' '}
                по технологии{' '}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {selectedTechnology}
                </span>
              </>
            )}
            {searchQuery && (
              <>
                {' '}
                с запросом{' '}
                <span className="font-semibold text-gray-900 dark:text-white">
                  “{searchQuery}”
                </span>
              </>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {(searchQuery || selectedTechnology) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="rounded-md border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Сбросить фильтры
              </button>
            )}
            <button
              type="button"
              onClick={() => void loadProjects()}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
            >
              {loading ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin text-white dark:text-gray-900"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  Обновляем...
                </>
              ) : (
                <>
                  <svg
                    className="h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.023 9.348h4.992V4.356M2.985 15.652v4.992h4.992M3 9l3.75-3.75M21 15l-3.75 3.75"
                    />
                  </svg>
                  Обновить
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Grid-panel с проектами */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600 dark:text-gray-400">Загрузка проектов...</div>
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          <p className="mb-3 font-medium">{error}</p>
          <button
            type="button"
            onClick={() => void loadProjects()}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-500 dark:bg-red-500 dark:hover:bg-red-400"
          >
            Повторить попытку
          </button>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center dark:border-gray-800 dark:bg-gray-900">
          <p className="text-gray-600 dark:text-gray-400">
            {searchQuery || selectedTechnology
              ? 'Проекты не найдены по заданным критериям'
              : 'Проекты пока не добавлены'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
