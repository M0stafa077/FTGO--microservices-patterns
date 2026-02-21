export interface RestaurantsTable {
  id: string;
  street1: string;
  street2: string | null;
  city: string;
  state: string;
  zip: string;
  createdAt: Date;
}
