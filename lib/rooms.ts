import type { Room } from "./types";

export const rooms: Room[] = [
  {
    id: "single",
    nameEn: "Single Room",
    nameAr: "غرفة فردية",
    priceKWD: 26,
    capacity: 1,
    beds: 1,
    baths: 1,
    sizeSqm: 22,
    rating: 4.7,
    reviews: 124,
    descEn:
      "A serene single retreat with a plush single bed, blackout curtains, and a sunlit reading nook overlooking the garden.",
    descAr:
      "غرفة هادئة بسرير فردي فاخر وستائر معتمة وركن قراءة مشرق يطلّ على الحديقة.",
    amenitiesEn: ["Free Wi-Fi", "Smart TV", "Workspace", "Rain shower"],
    amenitiesAr: ["واي فاي مجاني", "تلفزيون ذكي", "مكتب عمل", "دش مطر"],
    imageUrl:
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80",
    ],
  },
  {
    id: "double",
    nameEn: "Double Room",
    nameAr: "غرفة مزدوجة",
    priceKWD: 39,
    capacity: 2,
    beds: 1,
    baths: 1,
    sizeSqm: 32,
    rating: 4.8,
    reviews: 218,
    descEn:
      "Spacious double room with a king bed, marble bath, and a private balcony made for slow mornings.",
    descAr:
      "غرفة مزدوجة واسعة بسرير ملكي وحمّام رخامي وشرفة خاصة للصباحات الهادئة.",
    amenitiesEn: ["King bed", "Balcony", "Bathtub", "Mini bar"],
    amenitiesAr: ["سرير ملكي", "شرفة", "حوض استحمام", "ميني بار"],
    imageUrl:
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1600&q=80",
    ],
  },
  {
    id: "suite",
    nameEn: "Executive Suite",
    nameAr: "جناح تنفيذي",
    priceKWD: 78,
    capacity: 2,
    beds: 1,
    baths: 2,
    sizeSqm: 58,
    rating: 4.9,
    reviews: 96,
    descEn:
      "Premium suite with a separate lounge, espresso bar, walk-in closet, and floor-to-ceiling city views.",
    descAr:
      "جناح فاخر بصالة منفصلة وركن إسبريسو وخزانة ملابس واسعة وإطلالة مدينة بانورامية.",
    amenitiesEn: ["Lounge area", "City view", "Espresso bar", "Premium toiletries"],
    amenitiesAr: ["صالة جلوس", "إطلالة على المدينة", "ركن قهوة", "مستلزمات فاخرة"],
    imageUrl:
      "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=80",
    ],
  },
  {
    id: "family",
    nameEn: "Family Room",
    nameAr: "غرفة عائلية",
    priceKWD: 59,
    capacity: 4,
    beds: 2,
    baths: 2,
    sizeSqm: 48,
    rating: 4.8,
    reviews: 152,
    descEn:
      "Generously sized family room with two queen beds, a kids' nook, and a calm courtyard outlook.",
    descAr:
      "غرفة عائلية فسيحة بسريرين كبيرين وركن للأطفال وإطلالة هادئة على الفناء.",
    amenitiesEn: ["Two queen beds", "Kids nook", "Quiet courtyard", "Family bath"],
    amenitiesAr: ["سريران كبيران", "ركن للأطفال", "فناء هادئ", "حمّام عائلي"],
    imageUrl:
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80",
    ],
  },
];

export const heroSlides: { url: string; eyebrow: string; title: string; titleAr: string }[] = [
  {
    url: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=2200&q=85",
    eyebrow: "Stay · إقامة",
    title: "Find your perfect retreat",
    titleAr: "اكتشف ملاذك المثالي",
  },
  {
    url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2200&q=85",
    eyebrow: "Comfort · راحة",
    title: "Comfort, designed for you",
    titleAr: "راحة مصمّمة خصيصاً لك",
  },
  {
    url: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=2200&q=85",
    eyebrow: "Service · خدمة",
    title: "Hospitality that feels like home",
    titleAr: "ضيافة تشعرك بالبيت",
  },
];

export const ambianceImageUrl =
  "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=2000&q=85";

export const heroImageUrl = heroSlides[0].url;

export function findRoom(id: string | null | undefined): Room | undefined {
  if (!id) return undefined;
  return rooms.find((r) => r.id === id);
}
