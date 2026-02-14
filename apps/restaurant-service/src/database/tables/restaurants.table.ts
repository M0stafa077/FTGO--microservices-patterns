export interface RestaurantsTable {
  id: string;
  name: string;
  street1: string;
  street2: string | null;
  city: string;
  state: string;
  zip: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}
