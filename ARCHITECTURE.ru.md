# Архитектура

## Цель

Создать статический browser-security scenario lab для browser-extension QA, regression testing, controlled security research demos и red/blue/purple team validation без backend-сложности и без увеличения серверной поверхности атаки.

## Модель позиционирования

Стенд должен проектироваться прежде всего как среда валидации детекторов.

- основной use case: проверка browser-extension детекторов на скрытое или обманное поведение веб-страниц
- вторичный use case: воспроизводимые security research demos в контролируемых средах
- архитектурный вектор: benchmark-lite валидация, а не универсальная security-simulation платформа
- принцип разграничения: не phishing platform, не crawler, не reputation service

## Архитектурная модель

- модель поставки: только статический хостинг
- модель runtime: только клиентская логика
- модель разработки: local-first, кроссплатформенно
- браузерная модель: standards-first, без зависимости от API расширений
- модель данных: манифесты сценариев плюс seed-управляемые мутации
- модель модулей: реализованные модули плюс документированные planned modules
- модель оценки: каждый зрелый сценарий должен отдавать expected outcomes и rationale metadata
- модель case-registry: реальные reference-наблюдения хранятся как Markdown-кейсы и по возможности маппятся на сценарии lab

## Рекомендуемая структура проекта

```text
Web Security Scenario Lab/
|
|-- README.md
|-- README.ru.md
|-- package.json
|-- vite.config.js
|-- index.html
|-- pages/
|   |-- visual-manipulation/
|   |   |-- index.html
|   |   |-- hidden-text.html
|   |   |-- hidden-inputs.html
|   |   |-- overlays.html
|   |   `-- style-obfuscation.html
|   |-- link-domain-security/
|   |   |-- index.html
|   |   |-- homographs.html
|   |   |-- visible-mismatch.html
|   |   |-- redirects.html
|   |   `-- unsafe-protocols.html
|   |-- trigger-phrases/
|   |   |-- index.html
|   |   `-- placeholder.html
|   |-- prompt-splitting/
|   |   |-- index.html
|   |   `-- placeholder.html
|   `-- api-interception/
|       |-- index.html
|       `-- placeholder.html
|-- src/
|   |-- app/
|   |-- engine/
|   |-- evaluation/
|   |-- i18n/
|   |-- scenarios/
|   `-- ui/
|-- data/
|   |-- scenarios/
|   |-- evaluation/
|   |-- trigger-phrases/
|   |-- prompt-splitting/
|   `-- api-interception/
|-- assets/
|   |-- backgrounds/
|   |-- images/
|   |-- fonts/
|   `-- libs/
`-- tests/
    `-- playwright/
```

## Навигационная модель

- `index.html` является главной страницей стенда.
- Главная страница должна содержать:
  - описание проекта
  - список поддерживаемых модулей
  - переключатель языка
  - заметку о совместимости браузеров
  - переходы к группам сценариев
  - статусные метки модулей, например `mvp` и `planned`
  - короткую заметку, что planned modules это точки расширения, а не пустые обещания продукта
- Каждая страница модуля должна содержать:
  - обзор модуля
  - список сценариев или placeholder-сообщение
  - переключатель static/dynamic там, где это реализовано
  - поле seed там, где это реализовано
  - кнопку reroll там, где это реализовано
  - evaluation summary там, где это реализовано
  - ссылку назад на главную страницу
  - заметку о возможности вклада для planned modules

## Модель статусов модулей

Начальный документированный набор модулей:

- `visual-manipulation` - цель MVP
- `link-domain-security` - цель MVP
- `trigger-phrases` - planned module, только placeholder
- `prompt-splitting` - planned module, только placeholder
- `api-interception` - planned module, только placeholder

Planned modules должны присутствовать в навигации и структуре с самого начала, чтобы желающие могли расширять их без перестройки информационной архитектуры.

## Движок сценариев

Движок сценариев должен оставаться простым и детерминированным.

- загружать манифест сценария из локального JSON
- применять генератор случайности с seed
- рендерить только из заранее разрешённых шаблонов
- менять содержимое при первом открытии, ручном reroll или по таймеру
- показывать метаданные сценария в UI для упрощения отладки
- для planned modules возвращать безопасные placeholder-состояния вместо битых маршрутов

## Evaluation Layer

Стенд не должен останавливаться на генерации страниц. Он должен также описывать ожидаемое поведение детектора.

Каждый зрелый сценарий должен уметь публиковать:

- expected signal
- detector should fire или should not fire
- severity
- tags
- объяснение, почему страница подозрительна или намеренно benign
- coverage dimensions, например hidden text, tiny font, off-screen placement, z-index masking, misleading anchor text, punycode или mixed-script паттерны, protocol abuse

## Benchmark-Lite UI

Следующие элементы стоит считать частью целевой архитектуры уже сейчас, даже если полная реализация будет этапной:

- `why flagged` panel, показывающая какие встроенные сигналы есть на текущей странице
- coverage matrix, показывающая какие эвристики представлены в каждом сценарии
- scenario evaluation summary, привязанная к активному seed и варианту страницы
- явное разделение между intentionally suspicious и intentionally benign страницами

Это переводит проект из состояния просто набора страниц в benchmark-lite regression lab.

## Покрытие библиотек

Стенд должен включать страницы, имитирующие типовые frontend-окружения:

- обычный DOM
- `jQuery`
- `React`
- `Vue`
- `Shadow DOM`
- встраивание через `iframe`

Цель здесь в устойчивости детекторов, а не в полном повторении возможностей фреймворков. Каждая такая страница должна оставаться минимальной и сосредоточенной на различиях поведения DOM.

## Поддержка динамических страниц

Динамические страницы входят в обязательный объём.

- отложенная вставка DOM-узлов
- периодическая замена содержимого
- изменение атрибутов
- перестановка class names
- перегенерация ссылок
- смена фонов и контрастов
- изменение таймингов overlay

Все такие изменения должны выполняться только в браузере.

## Правила разработки

- использовать только кроссплатформенные npm-скрипты
- не опираться на shell-специфичные команды в основном workflow
- для генерации и валидации предпочитать Node-based helper scripts
- все сторонние библиотеки, используемые в сценариях, держать локально в репозитории
- не зависеть от внешних CDN во время runtime
- planned modules должны оставаться документированными до момента реальной реализации
- данные сценариев нужно проектировать так, чтобы evaluation metadata могла расширяться без ломки маршрутов

## Что не входит в проект

- аутентификация
- multi-user функциональность
- постоянное хранение пользовательского контента
- production backend
- серверная аналитика

