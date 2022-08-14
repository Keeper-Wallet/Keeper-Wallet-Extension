import { faker } from '@faker-js/faker';

export class DataGenerator {
  accountName = (prefix: string): string =>
    `${prefix}_${faker.random.numeric(22, { allowLeadingZeros: true })}`;
}
