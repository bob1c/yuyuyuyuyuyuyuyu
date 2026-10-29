# PULSE — новости, мемы, тренды, персоны (всё на GitHub, бесплатно)

Как это работает: GitHub Actions каждые ~30 сек собирает данные из источников и кладёт в ветку `data`.
Сайт (GitHub Pages) читает этот файл каждые 5 сек. Всё старше 12 часов автоматически удаляется.

## Установка

### 1. Аккаунт и репозиторий
1. Зарегистрируйся на https://github.com (если нет аккаунта).
2. Нажми «+» справа сверху -> New repository.
3. Имя, например `pulse`. Обязательно выбери **Public** (иначе Pages и бесплатные минуты Actions не сработают). Нажми Create repository.

### 2. Загрузка файлов
1. Распакуй zip на ПК.
2. В репозитории нажми «uploading an existing file».
3. Перетащи ВСЁ содержимое папки, **включая папку `.github`** (она скрытая: в Windows включи «Показать скрытые элементы» в Проводнике -> Вид).
   Если браузер не даёт перетащить папку `.github` — установи GitHub Desktop или загрузи файлы `collect.yml` и `post.yml` через Add file -> Create new file с именами `.github/workflows/collect.yml` и `.github/workflows/post.yml`.
4. Внизу нажми Commit changes.

### 3. Права для Actions
Settings -> Actions -> General -> Workflow permissions -> **Read and write permissions** -> Save.

### 4. Включить сайт
Settings -> Pages -> Source: **Deploy from a branch** -> Branch: `main`, папка `/ (root)` -> Save.
Через 1-2 минуты сверху появится адрес: `https://ТВОЙ_НИК.github.io/pulse/`

### 5. Первый запуск сборщика
Вкладка Actions -> слева «collect» -> Run workflow -> Run workflow. (Если GitHub просит включить Actions — нажми зелёную кнопку.)
Подожди 1-2 минуты, открой сайт. Дальше сборщик запускается сам каждые 5 минут и крутится ~30-секундным циклом.
Если зелёной галочки нет — открой запуск и посмотри лог: строки `x ИМЯ ошибка` — это недоступные источники, они просто пропускаются.

### 6. TikTok (по желанию)
Settings -> Secrets and variables -> Actions -> вкладка Secrets -> New repository secret:
- `TIKTOK_URL` — адрес API, который ты используешь
- `TIKTOK_KEY` — твой ключ
Лимит учтён: не больше ~48 запросов в сутки.

### 7. Telegram-канал (по желанию)
1. В Telegram напиши @BotFather -> /newbot -> получишь токен.
2. Добавь бота админом в свой канал (право публиковать).
3. Secrets: `BOT_TOKEN` (токен бота), `CHANNEL_ID` (@username канала или -100...).
4. Автопост: вкладка Variables -> New variable: `AUTO_POST` = `1`, `AUTO_CATS` = `news,trends` (какие вкладки слать автоматически).
5. Кнопка «В Telegram-канал» на сайте: GitHub -> твой профиль -> Settings -> Developer settings -> Personal access tokens -> Fine-grained tokens -> Generate. Выбери только этот репозиторий, Permissions -> Contents: **Read and write**. Токен вставь на сайте один раз (хранится только в твоём браузере).

## Свои источники
Открой `collect.js`, раздел «ИСТОЧНИКИ» (можно прямо на GitHub: файл -> карандаш -> Commit).
- Telegram-канал: добавь username в список (публичные каналы).
- Сайт: добавь `['Название', 'ссылка на RSS']`.
- `every` — пауза опроса в секундах.

## Если что-то не работает
- Сайт пишет «жду первый запуск сборщика» — не запущен collect (шаг 5) или не включены права (шаг 3).
- Сайт 404 — не включён Pages (шаг 4) или репозиторий приватный.
- Пустая вкладка — смотри лог Actions, источники могут блокировать GitHub.
