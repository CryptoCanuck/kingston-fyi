import * as migration_20260531_174114_initial from './20260531_174114_initial';

export const migrations = [
  {
    up: migration_20260531_174114_initial.up,
    down: migration_20260531_174114_initial.down,
    name: '20260531_174114_initial'
  },
];
