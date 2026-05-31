import * as migration_20260531_174114_initial from './20260531_174114_initial';
import * as migration_20260531_175200_cities_and_media_city from './20260531_175200_cities_and_media_city';
import * as migration_20260531_175959_users_roles from './20260531_175959_users_roles';
import * as migration_20260531_180348_taxonomies from './20260531_180348_taxonomies';

export const migrations = [
  {
    up: migration_20260531_174114_initial.up,
    down: migration_20260531_174114_initial.down,
    name: '20260531_174114_initial',
  },
  {
    up: migration_20260531_175200_cities_and_media_city.up,
    down: migration_20260531_175200_cities_and_media_city.down,
    name: '20260531_175200_cities_and_media_city',
  },
  {
    up: migration_20260531_175959_users_roles.up,
    down: migration_20260531_175959_users_roles.down,
    name: '20260531_175959_users_roles',
  },
  {
    up: migration_20260531_180348_taxonomies.up,
    down: migration_20260531_180348_taxonomies.down,
    name: '20260531_180348_taxonomies'
  },
];
