# Getting Started

## How to use

Run the following commands in the root directory.

```bash
npm install --save-dev
npm watch
```

### Description
Здесь я вынес части кода по разным файлам, чтобы не копилось всё в одном.

Теперь есть несколько модулей:
- Game - `src/game.js`: Основная бизнес-логика игры
- Pixi - `src/pixi.js`: Модуль работы с графикой Pixi.js 
- Server - `src/server.js`: Модуль работы с сервером, обращение, создание пользователя и т.д.
- User - `src\user.js`: Пользователь и работа с пользователем
- helpers - `src\helpers.js`: Вспомогательные функции