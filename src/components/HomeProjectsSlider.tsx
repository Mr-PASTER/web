import { useEffect, useMemo, useRef, useState } from 'react';
import type { TouchEventHandler } from 'react';
import ProjectCard from './ProjectCard';
import { getProjects } from '../services/api';
import type { Project } from '../types';

interface SliderState {
  loading: boolean;
  error: string | null;
  projects: Project[];
}

const SWIPE_THRESHOLD_PX = 45;
const DESKTOP_SLIDE_GROUP_SIZE = 3;
const TABLET_SLIDE_GROUP_SIZE = 2;
const MOBILE_SLIDE_GROUP_SIZE = 1;
const TABLET_BREAKPOINT_PX = 640;
const DESKTOP_BREAKPOINT_PX = 1024;

const getSlideGroupSize = () => {
  if (typeof window === 'undefined') {
    return DESKTOP_SLIDE_GROUP_SIZE;
  }
  const viewportWidth = window.innerWidth;

  if (viewportWidth >= DESKTOP_BREAKPOINT_PX) {
    return DESKTOP_SLIDE_GROUP_SIZE;
  }
  if (viewportWidth >= TABLET_BREAKPOINT_PX) {
    return TABLET_SLIDE_GROUP_SIZE;
  }
  return MOBILE_SLIDE_GROUP_SIZE;
};

export default function HomeProjectsSlider() {
  const [{ loading, error, projects }, setSliderState] = useState<SliderState>({
    loading: true,
    error: null,
    projects: [],
  });
  const [activeIndex, setActiveIndex] = useState(0);
  const [slideGroupSize, setSlideGroupSize] = useState<number>(() => getSlideGroupSize());
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);

  const slides = useMemo(() => {
    if (projects.length === 0) {
      return [] as Project[][];
    }
    const chunks: Project[][] = [];
    for (let index = 0; index < projects.length; index += slideGroupSize) {
      chunks.push(projects.slice(index, index + slideGroupSize));
    }
    return chunks;
  }, [projects, slideGroupSize]);

  useEffect(() => {
    const updateSlideGroupSize = () => {
      setSlideGroupSize(getSlideGroupSize());
    };

    updateSlideGroupSize();
    window.addEventListener('resize', updateSlideGroupSize);

    return () => {
      window.removeEventListener('resize', updateSlideGroupSize);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadProjects() {
      setSliderState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await getProjects({ limit: 12 });
        if (!isMounted) {
          return;
        }

        setSliderState({
          loading: false,
          error: null,
          projects: response.projects,
        });
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        console.error('Failed to load featured projects', requestError);
        setSliderState({
          loading: false,
          error: 'Не удалось загрузить проекты. Попробуйте обновить страницу.',
          projects: [],
        });
      }
    }

    void loadProjects();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (slides.length === 0) {
      setActiveIndex(0);
      return;
    }

    setActiveIndex((prevIndex) => Math.min(prevIndex, slides.length - 1));
  }, [slides.length]);

  const goToSlide = (index: number) => {
    if (slides.length === 0) {
      return;
    }
    const normalizedIndex = (index + slides.length) % slides.length;
    setActiveIndex(normalizedIndex);
  };

  const handlePrevious = () => {
    goToSlide(activeIndex - 1);
  };

  const handleNext = () => {
    goToSlide(activeIndex + 1);
  };

  const handleTouchStart: TouchEventHandler<HTMLDivElement> = (event) => {
    const firstTouch = event.touches[0];
    touchStartX.current = firstTouch.clientX;
    touchDeltaX.current = 0;
  };

  const handleTouchMove: TouchEventHandler<HTMLDivElement> = (event) => {
    if (touchStartX.current === null) {
      return;
    }
    const currentX = event.touches[0].clientX;
    touchDeltaX.current = currentX - touchStartX.current;
  };

  const handleTouchEnd: TouchEventHandler<HTMLDivElement> = () => {
    if (touchStartX.current === null) {
      return;
    }

    if (Math.abs(touchDeltaX.current) > SWIPE_THRESHOLD_PX) {
      if (touchDeltaX.current > 0) {
        handlePrevious();
      } else {
        handleNext();
      }
    }

    touchStartX.current = null;
    touchDeltaX.current = 0;
  };

  return (
    <section className="bg-gray-50 py-16 dark:bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-3xl font-semibold text-gray-900 dark:text-white md:text-4xl">
              Наши проекты
            </h2>
            <p className="mt-2 max-w-2xl text-base text-gray-600 dark:text-gray-400">
              Представляем несколько реализованных кейсов. Перелистывайте, чтобы увидеть все проекты.
            </p>
          </div>
          {slides.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevious}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                aria-label="Предыдущие проекты"
              >
                <span aria-hidden="true">←</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                aria-label="Следующие проекты"
              >
                <span aria-hidden="true">→</span>
              </button>
            </div>
          )}
        </div>

        <div className="relative mx-auto max-w-6xl">
          <div
            className="overflow-hidden rounded-2xl bg-white shadow-lg dark:bg-gray-900"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(-${activeIndex * 100}%)`,
              }}
            >
              {loading ? (
                <div className="w-full flex-shrink-0 px-4 py-6 sm:px-6">
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: slideGroupSize }).map((_, index) => (
                      <div key={`skeleton-${index}`} className="animate-pulse space-y-4 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
                        <div className="aspect-video w-full rounded bg-gray-200 dark:bg-gray-800" />
                        <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-800" />
                        <div className="space-y-2">
                          <div className="h-3 w-full rounded bg-gray-200 dark:bg-gray-800" />
                          <div className="h-3 w-5/6 rounded bg-gray-200 dark:bg-gray-800" />
                          <div className="h-3 w-2/3 rounded bg-gray-200 dark:bg-gray-800" />
                        </div>
                        <div className="flex gap-2">
                          <div className="h-6 w-16 rounded-full bg-gray-200 dark:bg-gray-800" />
                          <div className="h-6 w-20 rounded-full bg-gray-200 dark:bg-gray-800" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : slides.length > 0 ? (
                slides.map((slide, slideIndex) => (
                  <div key={`slide-${slideIndex}`} className="w-full flex-shrink-0 px-4 py-6 sm:px-6">
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {slide.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="w-full flex-shrink-0 px-4 py-6 sm:px-6">
                  <div className="rounded-2xl border border-dashed border-gray-300 p-10 text-center dark:border-gray-700">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Проекты пока недоступны
                    </h3>
                    <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                      Мы обновляем нашу коллекцию. Загляните позже, чтобы увидеть новые кейсы.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">
              {error}
            </div>
          )}

          {slides.length > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              {slides.map((_, index) => (
                <button
                  key={`indicator-${index}`}
                  type="button"
                  onClick={() => goToSlide(index)}
                  className={`h-2.5 w-5 rounded-full transition ${activeIndex === index
                    ? 'bg-blue-600 dark:bg-blue-400'
                    : 'bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600'
                    }`}
                  aria-label={`Показать проекты ${index * slideGroupSize + 1}–${Math.min(
                    (index + 1) * slideGroupSize,
                    projects.length
                  )}`}
                  aria-current={activeIndex === index}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}


