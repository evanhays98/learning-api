import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'learning',
  password: 'learning',
  database: 'learning',
  synchronize: true,
  logging: true,
  entities: ['src/**/*.entity.{ts,js}'],
  subscribers: [],
  migrations: [],
});

AppDataSource.initialize()
  .then(() => {
    // here you can start to work with your database
  })
  .catch((error) => console.log(error));
