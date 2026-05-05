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
  },
  {
    id: "double",
    nameEn: "Double Room",
    nameAr: "غرفة مزدوجة",
    priceSAR: 480,
    capacity: 2,
    descEn: "Spacious room with a double bed, perfect for couples.",
    descAr: "غرفة واسعة بسرير مزدوج، مثالية للزوجين.",
  },
  {
    id: "suite",
    nameEn: "Executive Suite",
    nameAr: "جناح تنفيذي",
    priceSAR: 950,
    capacity: 2,
    descEn: "Premium suite with a separate living area and city view.",
    descAr: "جناح فاخر بصالة منفصلة وإطلالة على المدينة.",
  },
  {
    id: "family",
    nameEn: "Family Room",
    nameAr: "غرفة عائلية",
    priceSAR: 720,
    capacity: 4,
    descEn: "Large room for up to 4 guests with two queen beds.",
    descAr: "غرفة كبيرة تستوعب حتى 4 ضيوف بسريرين كبيرين.",
  },
];

export function findRoom(id: string | null | undefined): Room | undefined {
  if (!id) return undefined;
  return rooms.find((r) => r.id === id);
}
