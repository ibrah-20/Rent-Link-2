export type Role = 'TENANT' | 'LANDLORD' | 'ADMIN';
export type HouseType = 'SINGLE_ROOM' | 'BEDSITTER' | 'ONE_BEDROOM' | 'TWO_BEDROOM' | 'THREE_BEDROOM';
export type ListingStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
export type UnitStatus = 'VACANT' | 'OCCUPIED' | 'RESERVED';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: Role;
  avatar?: string | null;
  isVerified: boolean;
  createdAt: string | Date;
}

export interface ApartmentImage {
  id: string;
  url: string;
  publicId?: string | null;
  isCover: boolean;
  apartmentId: string;
}

export interface Unit {
  id: string;
  unitNumber: string;
  floor?: number | null;
  status: UnitStatus;
  price?: number | null;
  notes?: string | null;
  apartmentId: string;
  updatedAt: string | Date;
  createdAt?: string | Date;
}

export interface Apartment {
  id: string;
  name: string;
  description: string;
  houseType: HouseType;
  totalUnits: number;
  pricePerMonth: number;
  status: ListingStatus;
  amenities: string[];
  address: string;
  neighborhood: string;
  latitude?: number | null;
  longitude?: number | null;
  landlordId: string;
  landlord?: Partial<User> | null;
  images?: ApartmentImage[];
  units?: Unit[];
  vacantCount?: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface JWTPayload {
  userId: string;
  role: Role;
  email: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface SearchFilters {
  houseType?: HouseType;
  neighborhood?: string;
  minPrice?: number;
  maxPrice?: number;
  vacantOnly?: boolean;
  page?: number;
  limit?: number;
}

export const NEIGHBORHOODS = [
  'Gate A', 'Gate B', 'Gate C', 'Gate D',
  'Macedonia', 'Mau Narok', 'Enkare', 'Kaloleni',
  'CBD', 'Pipeline', 'Milimani', 'Other'
] as const;

export const HOUSE_TYPE_LABELS: Record<HouseType, string> = {
  SINGLE_ROOM: 'Single Room',
  BEDSITTER: 'Bedsitter',
  ONE_BEDROOM: 'One Bedroom',
  TWO_BEDROOM: 'Two Bedroom',
  THREE_BEDROOM: 'Three Bedroom',
};

export const AMENITIES_LIST = [
  'Water', 'Electricity', 'WiFi', 'Parking',
  'Security', 'CCTV', 'Balcony', 'Garden',
  'Laundry', 'Generator', 'Elevator', 'Gym',
] as const;
