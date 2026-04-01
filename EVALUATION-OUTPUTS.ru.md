# Evaluation Outputs

## Цель

Стенд должен выдавать исследователю evaluation artifacts вместе с самими сценариями. Именно это превращает каталог страниц в benchmark-lite regression environment.

## Базовые поля оценки

Каждый зрелый сценарий должен уметь отдавать:

- `expectedSignal`
- `shouldFire`
- `severity`
- `tags`
- `whyFlagged`
- `whyBenign` там, где это уместно
- `coverageDimensions`
- `notes`

## Что означают поля

- `expectedSignal`: семейство детектора или категория эвристики, которую страница должна нагружать
- `shouldFire`: ожидается ли срабатывание детектора на данном варианте сценария
- `severity`: относительная серьёзность встроенного сигнального паттерна
- `tags`: короткие дескрипторы для маршрутизации, фильтрации и анализа покрытия
- `whyFlagged`: краткое объяснение, почему активный вариант страницы подозрителен
- `whyBenign`: объяснение для negative-control сценариев
- `coverageDimensions`: нормализованные метки конкретных трюков рендеринга или ссылочного обмана, встроенных в страницу
- `notes`: дополнительный исследовательский контекст при необходимости

## Целевые элементы UI

Benchmark-lite UI со временем должен показывать:

- `why flagged` panel
- expected outcome summary
- signal tags
- severity badge
- статус benign или suspicious
- элементы coverage matrix для активного сценария

## Примеры coverage dimensions

- hidden text
- color match
- tiny font
- off-screen placement
- clipping
- opacity suppression
- z-index masking
- misleading anchor text
- visible-target mismatch
- punycode или homograph pattern
- mixed-script domain
- unsafe protocol или schema obfuscation
- redirect parameter abuse

## Negative Controls

Не каждый сценарий должен выглядеть вредоносным. В стенде также должны быть intentionally benign или пограничные страницы, чтобы можно было изучать ложноположительные срабатывания.

## Направление хранения

Evaluation outputs нужно хранить как структурированную metadata рядом с определениями сценариев, а не только в виде текста в документации.
