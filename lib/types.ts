export type Room = {
  id: string;
  nameEn: string;
  nameAr: string;
  priceSAR: number;
  descEn: string;
  descAr: string;
  capacity: number;
};

export type BookingStatus = "pending" | "done";

export type Booking = {
  id: string;
  ref: string;
  roomId: string;
  roomNameEn: string;
  roomNameAr: string;
  fullName: string;
  phone: string;
  checkIn: string;
  notes?: string;
  status: BookingStatus;
  createdAt: string;
};

export type NewBookingInput = {
  roomId: string;
  fullName: string;
  phone: string;
  checkIn: string;
  notes?: string;
};
