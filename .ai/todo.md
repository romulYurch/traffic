# TODO — баги и бэклог

Починил — удали пункт и упомяни в `journal.md`. Нашёл новое — допиши с файлом и строкой.

## Блокеры

- **Разметка недоделана** — `Lane.calcSectionsMarkings` (коммит 9dcf7b3). Подробности —
  `skills/markings.md`. Пока не починено, машины выключены.
- **Канвас по высоте около 150 px.** `veiwport.js:16` берёт `$(document).height()`,
  а в момент DOM ready документ состоит только из канваса 300×150. Нужно
  `$(window).height()`. Заодно — пересчёт размера при `resize`.

## Баги

- `veiwport.js:321` — `addVehicle(new Point2d(...))` вместо `addVehicle({ point: ... })`.
  Работает случайно: срабатывает `vehicleSpown`.
- `veiwport.js:257` — `vehicles.length > vehicleMaxCnt` → машин на одну больше лимита.
- `vehicle.js:70` — `init()` кладёт в `crossSections` записи без `turnSection`, а отладочная
  отрисовка (`vehicle.js:140`) к нему обращается. Сейчас спасает только то, что запись
  снимается до первого кадра.
- `vehicle.js:193` — в условии проверяется `this.sensSection.next`, а разыменовывается
  `turnSection.next`. Упадёт, если `turnSection` — последняя секция полосы.
- `ViewPort.addVehicle` кладёт в массив и машины с `unusable = true`. На следующем тике
  `updatePos` на них может упасть до проверки `unusable`.
- `mouseSmothMove.js:25` — перетаскивание по `e.which == 1` на `mousemove`. Надёжнее
  `e.buttons & 1`. Не проверено, есть ли баг на практике.

## Чистка

- `js/roads.js` — не в сборке, удалить.
- `lane.js`: `draw(ctx)`, `drawCentralLane`, `drawCrosses`, `getSections` — остатки
  до ООП. `Section.drawCrosses` сразу возвращает `false`. Удалить вместе с вызовами
  в `road.js` и `veiwport.js`.
- `Number.prototype.zoom/toScreenX/toScreenY` — глобальный патч. Перенести в методы
  `ViewPort` (`toScreen(point)`, `scale(n)`).
- Опечатки в именах файлов: `veiwport.js`, `mouseSmothMove.js`, `vehicleSpown`.
- `turnChance` на деле означает шанс **не** повернуть — переименовать или инвертировать.

## Идеи на потом

- Индекс секций по `center` вместо O(n²) в `initRoads` и `addVehicle`.
- Статику (асфальт и разметку) рисовать один раз во внеэкранный канвас, в цикле — только
  машины.
- `requestAnimationFrame` вместо `setInterval` с шагом по реальному времени кадра.
- Взаимодействие машин: дистанция до впереди идущей, очередь на перекрёстке.
