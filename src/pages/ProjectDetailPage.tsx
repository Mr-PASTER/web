import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProject } from '../services/api';
import type { Project } from '../types';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (!id) {
      setError('ID проекта не указан');
      setLoading(false);
      return;
    }

    const loadProject = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getProject(id);
        if (data) {
          setProject(data);
        } else {
          setError('Проект не найден');
        }
      } catch (err) {
        setError('Не удалось загрузить проект. Попробуйте обновить страницу.');
        console.error('Error loading project:', err);
      } finally {
        setLoading(false);
      }
    };

    void loadProject();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center">
          <div className="text-gray-600 dark:text-gray-400">Загрузка проекта...</div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          <p className="mb-3 font-medium">{error || 'Проект не найден'}</p>
          <button
            type="button"
            onClick={() => navigate('/projects')}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-500 dark:bg-red-500 dark:hover:bg-red-400"
          >
            Вернуться к проектам
          </button>
        </div>
      </div>
    );
  }

  const images = project.images && project.images.length > 0 ? project.images : [project.previewImage];
  const currentImage = images[selectedImageIndex] || project.previewImage;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Кнопка назад */}
      <button
        type="button"
        onClick={() => navigate('/projects')}
        className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
      >
        <svg
          className="h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Назад к проектам
      </button>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Левая колонка - изображения */}
        <div className="space-y-4">
          {/* Главное изображение */}
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-800">
            <img
              src={currentImage}
              alt={project.title}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Галерея миниатюр */}
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative aspect-video overflow-hidden rounded-lg border-2 transition-all ${
                    selectedImageIndex === index
                      ? 'border-gray-900 dark:border-gray-100'
                      : 'border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${project.title} - изображение ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Правая колонка - информация */}
        <div className="space-y-6">
          {/* Заголовок */}
          <div>
            <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
              {project.title}
            </h1>
            {project.shortDescription && (
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {project.shortDescription}
              </p>
            )}
          </div>

          {/* Описание */}
          <div>
            <h2 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">
              Описание
            </h2>
            <p className="whitespace-pre-line text-gray-700 dark:text-gray-300">
              {project.description}
            </p>
          </div>

          {/* Технологии */}
          {project.technologies.length > 0 && (
            <div>
              <h2 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">
                Технологии
              </h2>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Отзыв клиента */}
          {project.clientReview && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-900">
              <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                Отзыв клиента
              </h2>
              <div className="space-y-4">
                <p className="text-lg italic text-gray-700 dark:text-gray-300">
                  "{project.clientReview.text}"
                </p>
                <div className="flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {project.clientReview.name}
                  </span>
                  {project.clientReview.rating > 0 && (
                    <div className="flex items-center gap-2">
                      <svg
                        className="h-5 w-5 text-yellow-500"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M11.048 2.927c.3-.921 1.603-.921 1.902 0l1.464 4.51a1 1 0 00.95.69h4.743c.969 0 1.371 1.24.588 1.81l-3.84 2.79a1 1 0 00-.364 1.118l1.464 4.51c.3.922-.755 1.688-1.538 1.118l-3.84-2.79a1 1 0 00-1.176 0l-3.84 2.79c-.783.57-1.838-.196-1.539-1.118l1.465-4.51a1 1 0 00-.365-1.118l-3.84-2.79c-.783-.57-.38-1.81.588-1.81h4.744a1 1 0 00.95-.69l1.464-4.51z" />
                      </svg>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {project.clientReview.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Действия */}
          <div className="flex flex-wrap gap-4">
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
              >
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                Открыть демо
              </a>
            )}
            <button
              type="button"
              onClick={() => navigate('/order')}
              className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-6 py-3 text-base font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Заказать похожий проект
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

