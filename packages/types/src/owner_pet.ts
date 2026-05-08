export type OwnerPets = {
  id: string;
  address: string;
  phone: string;
  profiles: {
    id: string;
    name: string;
    photo?: string | null;
    email: string;
  };
};
