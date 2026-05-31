import * as migration_20260531_174114_initial from './20260531_174114_initial';
import * as migration_20260531_175200_cities_and_media_city from './20260531_175200_cities_and_media_city';
import * as migration_20260531_175959_users_roles from './20260531_175959_users_roles';
import * as migration_20260531_180348_taxonomies from './20260531_180348_taxonomies';
import * as migration_20260531_183432_jobs_queue from './20260531_183432_jobs_queue';
import * as migration_20260531_190531_businesses from './20260531_190531_businesses';
import * as migration_20260531_191257_reviews from './20260531_191257_reviews';

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
    name: '20260531_180348_taxonomies',
  },
  {
    up: migration_20260531_183432_jobs_queue.up,
    down: migration_20260531_183432_jobs_queue.down,
    name: '20260531_183432_jobs_queue',
  },
  {
    up: migration_20260531_190531_businesses.up,
    down: migration_20260531_190531_businesses.down,
    name: '20260531_190531_businesses',
  },
  {
    up: migration_20260531_191257_reviews.up,
    down: migration_20260531_191257_reviews.down,
    name: '20260531_191257_reviews'
  },
];
