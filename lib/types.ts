export type Room = {
  id: string;
  nameEn: string;
  nameAr: string;
  priceKWD: number;
  descEn: string;
  descAr: string;
  capacity: number;
  imageUrl: string;
  gallery: string[];
  beds: number;
  baths: number;
  sizeSqm: number;
  rating: number;
  reviews: number;
  amenitiesEn: string[];
  amenitiesAr: string[];
};

export type BookingStatus = "pending" | "done";
export type PaymentStatus = "pending" | "paid" | "failed";

export type Booking = {
  id: string;
  ref: string;
  roomId: string;
  roomNameEn: string;
  roomNameAr: string;
  fullName: string;
  phone: string;
  checkIn: string;
  nights: number;
  totalKWD: number;
  paymentStatus: PaymentStatus;
  paymentId?: string;
  notes?: string;
  status: BookingStatus;
  createdAt: string;
};

export type NewBookingInput = {
  roomId: string;
  fullName: string;
  phone: string;
  checkIn: string;
  nights: number;
  notes?: string;
};
