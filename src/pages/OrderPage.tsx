import { useState } from 'react';

export default function OrderPage() {
  const [formMode, setFormMode] = useState<'full' | 'simple'>('full');
  const [socialNetwork, setSocialNetwork] = useState<'telegram' | 'whatsapp'>('telegram');
  const [formData, setFormData] = useState({
    projectIdea: '',
    contacts: '',
    name: '',
    socialContact: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Здесь будет логика отправки данных на сервер
    // Пока просто имитируем отправку
    await new Promise(resolve => setTimeout(resolve, 1000));

    setIsSubmitting(false);
    setSubmitSuccess(true);

    // Сброс формы через 3 секунды
    setTimeout(() => {
      setSubmitSuccess(false);
      setFormData({
        projectIdea: '',
        contacts: '',
        name: '',
        socialContact: ''
      });
      setSocialNetwork('telegram');
    }, 3000);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">Заказать проект</h1>
      <p className="mb-8 text-gray-600 dark:text-gray-400">
        Заполните форму, и мы свяжемся с вами в ближайшее время
      </p>

      {/* Переключатель режима формы */}
      <div className="mb-6 flex gap-4 rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-gray-800 dark:bg-gray-900">
        <button
          type="button"
          onClick={() => setFormMode('full')}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${formMode === 'full'
            ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-800 dark:text-white'
            : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
        >
          Полная форма
        </button>
        <button
          type="button"
          onClick={() => setFormMode('simple')}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${formMode === 'simple'
            ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-800 dark:text-white'
            : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
        >
          Только контакты
        </button>
      </div>

      {/* Форма */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          {formMode === 'full' ? (
            <>
              {/* Полная форма */}
              <div className="mb-6">
                <label htmlFor="projectIdea" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Идея проекта или техническое задание
                </label>
                <textarea
                  id="projectIdea"
                  name="projectIdea"
                  value={formData.projectIdea}
                  onChange={handleInputChange}
                  rows={6}
                  required
                  className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-500 transition-colors focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-gray-600 dark:focus:ring-gray-600"
                  placeholder="Опишите вашу идею проекта или прикрепите техническое задание..."
                />
              </div>

              <div className="mb-6">
                <label htmlFor="contacts" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Контакты для связи
                </label>
                <textarea
                  id="contacts"
                  name="contacts"
                  value={formData.contacts}
                  onChange={handleInputChange}
                  rows={3}
                  required
                  className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-500 transition-colors focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-gray-600 dark:focus:ring-gray-600"
                  placeholder="Укажите ваши контактные данные: телефон, email, мессенджер и т.д."
                />
              </div>
            </>
          ) : (
            <>
              {/* Простая форма - только контакты */}
              <div className="mb-6">
                <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                  Оставьте контакты для связи, и мы сами свяжемся с вами
                </p>
              </div>

              <div className="mb-4">
                <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Имя
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-500 transition-colors focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-gray-600 dark:focus:ring-gray-600"
                  placeholder="Ваше имя"
                />
              </div>

              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Соцсеть для связи
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSocialNetwork('telegram')}
                    className={`flex-1 rounded-md border px-4 py-2 text-sm font-medium transition-colors ${socialNetwork === 'telegram'
                      ? 'border-gray-900 bg-gray-900 text-white dark:border-gray-100 dark:bg-gray-100 dark:text-gray-900'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                      }`}
                  >
                    Телеграм
                  </button>
                  <button
                    type="button"
                    onClick={() => setSocialNetwork('whatsapp')}
                    className={`flex-1 rounded-md border px-4 py-2 text-sm font-medium transition-colors ${socialNetwork === 'whatsapp'
                      ? 'border-gray-900 bg-gray-900 text-white dark:border-gray-100 dark:bg-gray-100 dark:text-gray-900'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                      }`}
                  >
                    Ватсап
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="socialContact" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {socialNetwork === 'telegram' ? 'Телеграм' : 'Ватсап'} (username или номер)
                </label>
                <input
                  type="text"
                  id="socialContact"
                  name="socialContact"
                  value={formData.socialContact}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-500 transition-colors focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-gray-600 dark:focus:ring-gray-600"
                  placeholder={socialNetwork === 'telegram' ? '@username или номер телефона' : 'номер телефона'}
                />
              </div>
            </>
          )}

          {/* Кнопка отправки */}
          <button
            type="submit"
            disabled={isSubmitting || submitSuccess}
            className="w-full rounded-md bg-gray-900 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
          >
            {isSubmitting ? 'Отправка...' : submitSuccess ? 'Отправлено!' : 'Отправить'}
          </button>

          {submitSuccess && (
            <p className="mt-4 text-center text-sm text-green-600 dark:text-green-400">
              Спасибо! Мы свяжемся с вами в ближайшее время.
            </p>
          )}
        </div>
      </form>
    </div>
  );
}

