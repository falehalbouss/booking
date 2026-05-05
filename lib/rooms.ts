import type { Room } from "./types";

export const rooms: Room[] = [
  {
    id: "single",
    nameEn: "Single Room",
    nameAr: "غرفة فردية",
    priceSAR: 320,
    capacity: 1,
    descEn: "Cozy room for one guest with a comfortable single bed.",
    descAr: "غرفة مريحة لشخص واحد مع سرير فردي.",
    imageUrl:
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "double",
    nameEn: "Double Room",
    nameAr: "غرفة مزدوجة",
    priceSAR: 480,
    capacity: 2,
    descEn: "Spacious room with a double bed, perfect for couples.",
    descAr: "غرفة واسعة بسرير مزدوج، مثالية للزوجين.",
    imageUrl:
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "suite",
    nameEn: "Executive Suite",
    nameAr: "جناح تنفيذي",
    priceSAR: 950,
    capacity: 2,
    descEn: "Premium suite with a separate living area and city view.",
    descAr: "جناح فاخر بصالة منفصلة وإطلالة على المدينة.",
    imageUrl:
      "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "family",
    nameEn: "Family Room",
    nameAr: "غرفة عائلية",
    priceSAR: 720,
    capacity: 4,
    descEn: "Large room for up to 4 guests with two queen beds.",
    descAr: "غرفة كبيرة تستوعب حتى 4 ضيوف بسريرين كبيرين.",
    imageUrl:
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80",
  },
];

export const heroImageUrl =
  "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=2000&q=85";

export const ambianceImageUrl =
  "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1600&q=80";

export function findRoom(id: string | null | undefined): Room | undefined {
  if (!id) return undefined;
  return rooms.find((r) => r.id === id);
}
