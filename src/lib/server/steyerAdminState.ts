import fs from 'fs';
import path from 'path';

export interface SteyerAdminState {
  today: string;
  rooms: any[];
  units: any[];
  roomBookings: any[];
  extras: any[];
  equipment: any[];
  spaBookings: any[];
  treatments: any[];
  therapists: any[];
  blocks: any[];
  posts: any[];
  signups: any[];
  vouchers: any[];
  redemptions: any[];
  faq: any[];
  conciergeLog: any[];
  concierge: { ai: boolean; model: string; perDay: number; perVisitor: number };
  checkins: any[];
  enquiries: any[];
  resetAt: string;
}

const BASE_SEED_TODAY = '2026-10-12';

function shiftIsoDate(isoDate: string | null | undefined, diffDays: number): string {
  if (!isoDate || !/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return isoDate || '';
  const d = new Date(isoDate + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + diffDays);
  return d.toISOString().slice(0, 10);
}

function getTodayIso(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function createInitialSeed(): SteyerAdminState {
  const today = getTodayIso();
  const baseDate = new Date(BASE_SEED_TODAY + 'T12:00:00Z');
  const currDate = new Date(today + 'T12:00:00Z');
  const diffDays = Math.round((currDate.getTime() - baseDate.getTime()) / 86400000);
  const s = (d: string) => shiftIsoDate(d, diffDays);

  return {
    today,
    rooms: [
      {
        id: 1,
        slug: 'classic',
        name_de: 'Einzelzimmer Classic',
        name_en: 'Classic single',
        desc_de: 'Ruhig zum Innenhof, Schreibtisch, Regendusche.',
        desc_en: 'Quiet, facing the courtyard, desk, rain shower.',
        name_ru: 'Одноместный Classic',
        desc_ru: 'Тихий, с видом во двор, рабочий стол, тропический душ.',
        size: 18,
        max_guests: 1,
        prices: [89],
        image: 'https://demo.steyer.studio/stock/room-classic-1.webp',
        gallery: ['https://demo.steyer.studio/stock/room-classic-2.webp', 'https://demo.steyer.studio/stock/room-classic-3.webp'],
        active: true,
        sort: 0,
      },
      {
        id: 2,
        slug: 'garden',
        name_de: 'Doppelzimmer Garten',
        name_en: 'Garden double',
        desc_de: 'Ebenerdig mit Terrasse zum Garten, Kingsize-Bett.',
        desc_en: 'Ground floor with a terrace to the garden, king-size bed.',
        name_ru: 'Двухместный с садом',
        desc_ru: 'Первый этаж, терраса в сад, кровать king-size.',
        size: 26,
        max_guests: 2,
        prices: [109, 139],
        image: 'https://demo.steyer.studio/stock/room-garden-1.webp',
        gallery: ['https://demo.steyer.studio/stock/room-garden-2.webp', 'https://demo.steyer.studio/stock/room-garden-3.webp'],
        active: true,
        sort: 1,
      },
      {
        id: 3,
        slug: 'junior',
        name_de: 'Junior Suite mit Balkon',
        name_en: 'Junior suite with balcony',
        desc_de: 'Wohnbereich mit Schlafsofa, Balkon mit Blick ins Tal.',
        desc_en: 'Living area with sofa bed, balcony with a view of the valley.',
        name_ru: 'Полулюкс с балконом',
        desc_ru: 'Гостиная зона с диваном, балкон с видом на долину.',
        size: 38,
        max_guests: 3,
        prices: [169, 189, 219],
        image: 'https://demo.steyer.studio/stock/room-junior-1.webp',
        gallery: ['https://demo.steyer.studio/stock/room-junior-2.webp', 'https://demo.steyer.studio/stock/room-junior-3.webp'],
        active: true,
        sort: 2,
      },
      {
        id: 4,
        slug: 'family',
        name_de: 'Familienzimmer',
        name_en: 'Family room',
        desc_de: 'Zwei Räume, Babybett auf Wunsch, Badewanne.',
        desc_en: 'Two rooms, cot on request, bathtub.',
        name_ru: 'Семейный номер',
        desc_ru: 'Две комнаты, детская кроватка по запросу, ванна.',
        size: 44,
        max_guests: 4,
        prices: [139, 159, 189, 209],
        image: 'https://demo.steyer.studio/stock/room-family-1.webp',
        gallery: ['https://demo.steyer.studio/stock/room-family-2.webp', 'https://demo.steyer.studio/stock/room-family-3.webp'],
        active: true,
        sort: 3,
      },
    ],
    units: [
      { id: 1, room_id: 1, label: '101' },
      { id: 2, room_id: 1, label: '102' },
      { id: 3, room_id: 1, label: '103' },
      { id: 4, room_id: 2, label: '201' },
      { id: 5, room_id: 2, label: '202' },
      { id: 6, room_id: 2, label: '203' },
      { id: 7, room_id: 2, label: '204' },
      { id: 8, room_id: 3, label: '301' },
      { id: 9, room_id: 3, label: '302' },
      { id: 10, room_id: 4, label: '401' },
      { id: 11, room_id: 4, label: '402' },
    ],
    roomBookings: [
      { id: 1, created_at: '2026-09-17T12:00:31.418Z', room_id: 1, unit_id: 1, check_in: s('2026-10-08'), check_out: s('2026-10-11'), guests: 1, name: 'Anna Novak', email: 'anna.novak@example.com', phone: '+49 151 2039481', note: '', room_total: 267, total: 350, status: 'checked_out', source: 'email', lang: 'de' },
      { id: 39, created_at: '2026-09-28T15:00:34.733Z', room_id: 2, unit_id: 5, check_in: s('2026-10-08'), check_out: s('2026-10-09'), guests: 2, name: 'Elif Petersen', email: 'elif.p@example.com', phone: '+49 151 8849201', note: '', room_total: 139, total: 254, status: 'checked_out', source: 'online', lang: 'de' },
      { id: 13, created_at: '2026-10-02T13:00:32.559Z', room_id: 1, unit_id: 2, check_in: s('2026-10-09'), check_out: s('2026-10-11'), guests: 1, name: 'David Schmid', email: 'd.schmid@example.com', phone: '+49 151 4491023', note: '', room_total: 178, total: 214, status: 'checked_out', source: 'phone', lang: 'de' },
      { id: 66, created_at: '2026-09-24T21:00:37.431Z', room_id: 2, unit_id: 7, check_in: s('2026-10-09'), check_out: s('2026-10-10'), guests: 2, name: 'Sabine Jansen', email: 'sabine@example.com', phone: '', note: '', room_total: 139, total: 175, status: 'checked_out', source: 'phone', lang: 'de' },
      { id: 24, created_at: '2026-09-30T19:00:33.502Z', room_id: 1, unit_id: 3, check_in: s('2026-10-11'), check_out: s('2026-10-14'), guests: 1, name: 'Julia Yilmaz', email: 'julia.y@example.com', phone: '+49 151 7748291', note: 'Quiet room please', room_total: 267, total: 321, status: 'checked_in', source: 'email', lang: 'de' },
      { id: 28, created_at: '2026-09-06T14:00:33.934Z', room_id: 2, unit_id: 4, check_in: s('2026-10-11'), check_out: s('2026-10-13'), guests: 2, name: 'Sabine Yilmaz', email: 's.yilmaz@example.com', phone: '+49 151 9920183', note: '', room_total: 278, total: 278, status: 'checked_in', source: 'online', lang: 'de' },
      { id: 51, created_at: '2026-09-20T11:00:35.961Z', room_id: 2, unit_id: 6, check_in: s('2026-10-11'), check_out: s('2026-10-12'), guests: 1, name: 'Markus Wagner', email: '', phone: '', note: '', room_total: 109, total: 127, status: 'checked_out', source: 'online', lang: 'de' },
      { id: 67, created_at: '2026-09-06T18:00:37.502Z', room_id: 2, unit_id: 7, check_in: s('2026-10-11'), check_out: s('2026-10-12'), guests: 1, name: 'Markus Hofmann', email: '', phone: '', note: '', room_total: 109, total: 127, status: 'checked_out', source: 'online', lang: 'de' },
      { id: 75, created_at: '2026-09-02T12:00:38.151Z', room_id: 3, unit_id: 8, check_in: s('2026-10-11'), check_out: s('2026-10-12'), guests: 3, name: 'Anna Vogel', email: '', phone: '', note: '', room_total: 219, total: 219, status: 'checked_out', source: 'online', lang: 'de' },
      { id: 94, created_at: '2026-10-01T21:00:39.877Z', room_id: 4, unit_id: 10, check_in: s('2026-10-11'), check_out: s('2026-10-13'), guests: 2, name: 'Nina Berger', email: 'nina.berger@example.com', phone: '+49 151 6618294', note: '', room_total: 318, total: 419, status: 'checked_in', source: 'phone', lang: 'de' },
      { id: 40, created_at: '2026-09-11T07:00:34.872Z', room_id: 2, unit_id: 5, check_in: s('2026-10-12'), check_out: s('2026-10-15'), guests: 2, name: 'Nina Lorenz', email: 'nina.lorenz@example.com', phone: '+49 151 3349182', note: '', room_total: 417, total: 575, status: 'checked_in', source: 'phone', lang: 'de' },
      { id: 68, created_at: '2026-09-19T05:00:37.572Z', room_id: 2, unit_id: 7, check_in: s('2026-10-12'), check_out: s('2026-10-13'), guests: 2, name: 'Hannah Martin', email: 'hannah.m@example.com', phone: '+49 151 5519203', note: '', room_total: 139, total: 225, status: 'checked_in', source: 'phone', lang: 'de' },
      { id: 88, created_at: '2026-09-24T19:00:39.297Z', room_id: 3, unit_id: 9, check_in: s('2026-10-12'), check_out: s('2026-10-15'), guests: 2, name: 'Sophie Brandt', email: 'sophie.b@example.com', phone: '+49 151 7782910', note: '', room_total: 567, total: 675, status: 'checked_in', source: 'online', lang: 'de' },
      { id: 14, created_at: '2026-09-19T04:00:32.640Z', room_id: 1, unit_id: 2, check_in: s('2026-10-12'), check_out: s('2026-10-16'), guests: 1, name: 'Julia Fischer', email: 'j.fischer@example.com', phone: '+43 664 1928374', note: 'Arriving around 4pm', room_total: 356, total: 428, status: 'confirmed', source: 'online', lang: 'de' },
      { id: 52, created_at: '2026-09-02T22:00:36.036Z', room_id: 2, unit_id: 6, check_in: s('2026-10-12'), check_out: s('2026-10-15'), guests: 1, name: 'Stefan Hofmann', email: 'stefan.h@example.com', phone: '+49 151 3029184', note: '', room_total: 327, total: 381, status: 'confirmed', source: 'phone', lang: 'de' },
      { id: 69, created_at: '2026-09-28T20:00:37.678Z', room_id: 2, unit_id: 7, check_in: s('2026-10-13'), check_out: s('2026-10-17'), guests: 1, name: 'Thomas Roth', email: 't.roth@example.com', phone: '+49 151 9081726', note: '', room_total: 436, total: 508, status: 'confirmed', source: 'online', lang: 'de' },
      { id: 106, created_at: '2026-09-01T15:00:41.084Z', room_id: 4, unit_id: 11, check_in: s('2026-10-13'), check_out: s('2026-10-14'), guests: 4, name: 'Anna Kraus', email: 'anna.kraus@example.com', phone: '+49 151 6718293', note: 'Cot needed', room_total: 209, total: 281, status: 'confirmed', source: 'phone', lang: 'de' },
      { id: 2, created_at: '2026-09-13T21:00:31.547Z', room_id: 1, unit_id: 1, check_in: s('2026-10-14'), check_out: s('2026-10-15'), guests: 1, name: 'Julia Fischer', email: 'julia@example.com', phone: '', note: '', room_total: 89, total: 107, status: 'confirmed', source: 'online', lang: 'de' },
      { id: 3, created_at: '2026-09-20T21:00:31.626Z', room_id: 1, unit_id: 1, check_in: s('2026-10-15'), check_out: s('2026-10-17'), guests: 1, name: 'Markus Martin', email: 'markus@example.com', phone: '', note: '', room_total: 178, total: 178, status: 'confirmed', source: 'email', lang: 'de' },
      { id: 76, created_at: '2026-09-03T08:00:38.191Z', room_id: 3, unit_id: 8, check_in: s('2026-10-15'), check_out: s('2026-10-19'), guests: 2, name: 'Stefan Wagner', email: 's.wagner@example.com', phone: '', note: '', room_total: 756, total: 900, status: 'confirmed', source: 'phone', lang: 'de' },
      { id: 29, created_at: '2026-09-14T08:00:33.971Z', room_id: 2, unit_id: 4, check_in: s('2026-10-16'), check_out: s('2026-10-20'), guests: 2, name: 'Tim Berger', email: 'tim.b@example.com', phone: '', note: '', room_total: 556, total: 556, status: 'confirmed', source: 'online', lang: 'de' },
      { id: 95, created_at: '2026-09-12T18:00:39.992Z', room_id: 4, unit_id: 10, check_in: s('2026-10-16'), check_out: s('2026-10-19'), guests: 4, name: 'Elif Martin', email: 'elif.m@example.com', phone: '', note: '', room_total: 627, total: 879, status: 'confirmed', source: 'phone', lang: 'de' },
      { id: 4, created_at: '2026-09-22T18:00:31.665Z', room_id: 1, unit_id: 1, check_in: s('2026-10-17'), check_out: s('2026-10-20'), guests: 1, name: 'Elif Vogel', email: 'elif.v@example.com', phone: '', note: '', room_total: 267, total: 321, status: 'confirmed', source: 'email', lang: 'de' },
      { id: 53, created_at: '2026-09-21T18:00:36.112Z', room_id: 2, unit_id: 6, check_in: s('2026-10-17'), check_out: s('2026-10-18'), guests: 1, name: 'Sophie Kraus', email: 'sophie.k@example.com', phone: '', note: '', room_total: 109, total: 168, status: 'confirmed', source: 'online', lang: 'de' },
      { id: 15, created_at: '2026-09-04T09:00:32.713Z', room_id: 1, unit_id: 2, check_in: s('2026-10-18'), check_out: s('2026-10-20'), guests: 1, name: 'Sophie Schmid', email: 'sophie.s@example.com', phone: '', note: '', room_total: 178, total: 202, status: 'confirmed', source: 'online', lang: 'de' },
      { id: 41, created_at: '2026-09-09T07:00:34.978Z', room_id: 2, unit_id: 5, check_in: s('2026-10-18'), check_out: s('2026-10-22'), guests: 1, name: 'Laura Schmid', email: 'laura.s@example.com', phone: '', note: '', room_total: 436, total: 484, status: 'confirmed', source: 'email', lang: 'de' },
      { id: 54, created_at: '2026-09-14T10:00:36.256Z', room_id: 2, unit_id: 6, check_in: s('2026-10-18'), check_out: s('2026-10-21'), guests: 1, name: 'Sophie Berger', email: 'sophie.berger@example.com', phone: '', note: '', room_total: 327, total: 446, status: 'confirmed', source: 'email', lang: 'de' },
      { id: 96, created_at: '2026-09-06T18:00:40.100Z', room_id: 4, unit_id: 10, check_in: s('2026-10-19'), check_out: s('2026-10-22'), guests: 3, name: 'Sophie Novak', email: 'sophie.n@example.com', phone: '', note: '', room_total: 567, total: 729, status: 'confirmed', source: 'phone', lang: 'de' },
      { id: 70, created_at: '2026-09-13T10:00:37.753Z', room_id: 2, unit_id: 7, check_in: s('2026-10-20'), check_out: s('2026-10-23'), guests: 1, name: 'David Berger', email: 'david.b@example.com', phone: '', note: '', room_total: 327, total: 327, status: 'confirmed', source: 'online', lang: 'de' },
      { id: 77, created_at: '2026-09-03T10:00:38.263Z', room_id: 3, unit_id: 8, check_in: s('2026-10-20'), check_out: s('2026-10-22'), guests: 2, name: 'Nina Lorenz', email: 'nina.l@example.com', phone: '', note: '', room_total: 378, total: 450, status: 'confirmed', source: 'online', lang: 'de' },
      { id: 55, created_at: '2026-08-31T06:00:36.397Z', room_id: 2, unit_id: 6, check_in: s('2026-10-21'), check_out: s('2026-10-22'), guests: 2, name: 'Hannah Keller', email: 'h.keller@example.com', phone: '', note: '', room_total: 139, total: 254, status: 'confirmed', source: 'online', lang: 'de' },
      { id: 5, created_at: '2026-08-23T05:00:31.747Z', room_id: 1, unit_id: 1, check_in: s('2026-10-22'), check_out: s('2026-10-26'), guests: 1, name: 'Julia Keller', email: 'j.keller@example.com', phone: '', note: '', room_total: 356, total: 457, status: 'confirmed', source: 'email', lang: 'de' },
      { id: 25, created_at: '2026-08-30T13:00:33.573Z', room_id: 1, unit_id: 3, check_in: s('2026-10-19'), check_out: s('2026-10-21'), guests: 1, name: 'Sabine Brandt', email: 's.brandt@example.com', phone: '', note: '', room_total: 178, total: 214, status: 'cancelled', source: 'online', lang: 'de' },
    ],
    extras: [
      { id: 1, slug: 'breakfast', name_de: 'Frühstück', name_en: 'Breakfast', desc_de: 'Buffet von 7 bis 11 Uhr.', desc_en: 'Buffet from 7 to 11 am.', name_ru: 'Завтрак', desc_ru: 'Шведский стол с 7 до 11 часов.', unit: 'person_night', price: 18, stock: null, image: 'https://demo.steyer.studio/stock/extra-breakfast.webp', scope: 'room', treatment_ids: [], active: true, sort: 0 },
      { id: 2, slug: 'parking', name_de: 'Tiefgaragenplatz', name_en: 'Garage space', desc_de: 'Pro Auto, mit Ladestation.', desc_en: 'Per car, with charger.', name_ru: 'Место в гараже', desc_ru: 'За автомобиль, с зарядной станцией.', unit: 'night', price: 12, stock: 8, image: '', scope: 'room', treatment_ids: [], active: true, sort: 1 },
      { id: 3, slug: 'ebike', name_de: 'E-Bike', name_en: 'E-bike', desc_de: 'Mit Helm, Schloss und Tourenkarte.', desc_en: 'With helmet, lock and route map.', name_ru: 'Электровелосипед', desc_ru: 'Со шлемом, замком и картой маршрутов.', unit: 'day', price: 29, stock: 6, image: 'https://demo.steyer.studio/stock/extra-ebike.webp', scope: 'room', treatment_ids: [], active: true, sort: 2 },
      { id: 4, slug: 'sup', name_de: 'SUP-Board', name_en: 'SUP board', desc_de: 'Für den See, Paddel und Weste inklusive.', desc_en: 'For the lake, paddle and vest included.', name_ru: 'SUP-доска', desc_ru: 'Для озера, весло и жилет включены.', unit: 'day', price: 19, stock: 4, image: '', scope: 'room', treatment_ids: [], active: true, sort: 3 },
      { id: 5, slug: 'spa', name_de: 'Spa-Paket', name_en: 'Spa package', desc_de: 'Bademantel, Slipper und Sauna-Tee für den ganzen Aufenthalt.', desc_en: 'Bathrobe, slippers and sauna tea for the whole stay.', name_ru: 'Спа-пакет', desc_ru: 'Халат, тапочки и чай для сауны на всё пребывание.', unit: 'person_stay', price: 25, stock: null, image: 'https://demo.steyer.studio/stock/extra-spa.webp', scope: 'room', treatment_ids: [], active: true, sort: 4 },
      { id: 6, slug: 'late', name_de: 'Late Check-out', name_en: 'Late check-out', desc_de: 'Zimmer bis 14 Uhr statt 11 Uhr.', desc_en: 'Keep the room until 2 pm instead of 11 am.', name_ru: 'Поздний выезд', desc_ru: 'Номер до 14:00 вместо 11:00.', unit: 'stay', price: 30, stock: null, image: 'https://demo.steyer.studio/stock/extra-late.webp', scope: 'room', treatment_ids: [], active: true, sort: 5 },
      { id: 7, slug: 'argan', name_de: 'Bio-Arganöl', name_en: 'Organic argan oil', desc_de: 'Statt des Hausöls, kaltgepresst.', desc_en: 'Instead of the house oil, cold-pressed.', name_ru: 'Органическое аргановое масло', desc_ru: 'Вместо базового масла, холодного отжима.', unit: 'appointment', price: 9, stock: null, image: 'https://demo.steyer.studio/stock/spa-oil.webp', scope: 'spa', treatment_ids: [1, 7], active: true, sort: 6 },
      { id: 8, slug: 'heat', name_de: 'Wärmekissen', name_en: 'Heat pillow', desc_de: 'Kirschkernkissen für Nacken und Schultern.', desc_en: 'Cherry-stone pillow for neck and shoulders.', name_ru: 'Тёплая подушка', desc_ru: 'Подушка с вишнёвыми косточками для шеи и плеч.', unit: 'appointment', price: 7, stock: null, image: '', scope: 'spa', treatment_ids: [3, 5], active: true, sort: 7 },
      { id: 9, slug: 'footbath', name_de: 'Fußbad vorab', name_en: 'Foot bath first', desc_de: 'Zehn Minuten Salzbad vor der Behandlung.', desc_en: 'Ten minutes of salt bath before the treatment.', name_ru: 'Ванночка для ног', desc_ru: 'Десять минут солевой ванны перед процедурой.', unit: 'appointment', price: 8, stock: null, image: 'https://demo.steyer.studio/stock/spa-foot.webp', scope: 'spa', treatment_ids: [], active: true, sort: 8 },
      { id: 10, slug: 'tea', name_de: 'Tee und Obst', name_en: 'Tea and fruit', desc_de: 'Im Ruheraum nach der Behandlung.', desc_en: 'In the relaxation room after the treatment.', name_ru: 'Чай и фрукты', desc_ru: 'В комнате отдыха после процедуры.', unit: 'appointment', price: 6, stock: null, image: 'https://demo.steyer.studio/stock/extra-late.webp', scope: 'spa', treatment_ids: [], active: true, sort: 9 },
      { id: 11, slug: 'oil-home', name_de: 'Massageöl für zu Hause', name_en: 'Massage oil to take home', desc_de: '50 ml, die Mischung aus Ihrer Behandlung.', desc_en: '50 ml, the blend from your treatment.', name_ru: 'Масло для дома', desc_ru: '50 мл, смесь из вашей процедуры.', unit: 'appointment', price: 14, stock: 12, image: 'https://demo.steyer.studio/stock/extra-spa.webp', scope: 'spa', treatment_ids: [], active: true, sort: 10 },
    ],
    equipment: [
      { id: 30, created_at: '2026-09-30T22:00:33.537Z', extra_id: 1, room_booking_id: 24, spa_booking_id: null, date_from: s('2026-10-11'), date_to: s('2026-10-14'), qty: 1, total: 54, name: 'Julia Yilmaz', status: 'confirmed', source: 'online' },
      { id: 124, created_at: '2026-10-01T22:00:39.917Z', extra_id: 1, room_booking_id: 94, spa_booking_id: null, date_from: s('2026-10-11'), date_to: s('2026-10-13'), qty: 2, total: 72, name: 'Nina Berger', status: 'confirmed', source: 'online' },
      { id: 125, created_at: '2026-10-01T22:00:39.953Z', extra_id: 3, room_booking_id: 94, spa_booking_id: null, date_from: s('2026-10-11'), date_to: s('2026-10-12'), qty: 1, total: 29, name: 'Nina Berger', status: 'confirmed', source: 'online' },
      { id: 49, created_at: '2026-09-11T22:00:34.908Z', extra_id: 1, room_booking_id: 40, spa_booking_id: null, date_from: s('2026-10-12'), date_to: s('2026-10-15'), qty: 2, total: 108, name: 'Nina Lorenz', status: 'confirmed', source: 'online' },
      { id: 50, created_at: '2026-09-11T22:00:34.943Z', extra_id: 5, room_booking_id: 40, spa_booking_id: null, date_from: s('2026-10-12'), date_to: s('2026-10-15'), qty: 2, total: 50, name: 'Nina Lorenz', status: 'confirmed', source: 'online' },
      { id: 93, created_at: '2026-09-19T22:00:37.606Z', extra_id: 1, room_booking_id: 68, spa_booking_id: null, date_from: s('2026-10-12'), date_to: s('2026-10-13'), qty: 2, total: 36, name: 'Hannah Martin', status: 'confirmed', source: 'online' },
      { id: 94, created_at: '2026-09-19T22:00:37.640Z', extra_id: 5, room_booking_id: 68, spa_booking_id: null, date_from: s('2026-10-12'), date_to: s('2026-10-13'), qty: 2, total: 50, name: 'Hannah Martin', status: 'confirmed', source: 'online' },
      { id: 116, created_at: '2026-09-24T22:00:39.337Z', extra_id: 1, room_booking_id: 88, spa_booking_id: null, date_from: s('2026-10-12'), date_to: s('2026-10-15'), qty: 2, total: 108, name: 'Sophie Brandt', status: 'confirmed', source: 'online' },
      { id: 18, created_at: '2026-09-19T22:00:32.676Z', extra_id: 1, room_booking_id: 14, spa_booking_id: null, date_from: s('2026-10-12'), date_to: s('2026-10-16'), qty: 1, total: 72, name: 'Julia Fischer', status: 'confirmed', source: 'online' },
      { id: 67, created_at: '2026-09-02T22:00:36.075Z', extra_id: 1, room_booking_id: 52, spa_booking_id: null, date_from: s('2026-10-12'), date_to: s('2026-10-15'), qty: 1, total: 54, name: 'Stefan Hofmann', status: 'confirmed', source: 'online' },
      { id: 95, created_at: '2026-09-28T22:00:37.713Z', extra_id: 1, room_booking_id: 69, spa_booking_id: null, date_from: s('2026-10-13'), date_to: s('2026-10-17'), qty: 1, total: 72, name: 'Thomas Roth', status: 'confirmed', source: 'online' },
      { id: 142, created_at: '2026-09-01T22:00:41.122Z', extra_id: 1, room_booking_id: 106, spa_booking_id: null, date_from: s('2026-10-13'), date_to: s('2026-10-14'), qty: 4, total: 72, name: 'Anna Kraus', status: 'confirmed', source: 'online' },
      { id: 145, created_at: '2026-10-10T22:00:41.387Z', extra_id: 3, room_booking_id: null, spa_booking_id: null, date_from: s('2026-10-12'), date_to: s('2026-10-14'), qty: 5, total: 290, name: 'Peter Brandt', status: 'confirmed', source: 'desk' },
      { id: 158, created_at: '2026-10-12T16:48:39.050Z', extra_id: 7, room_booking_id: null, spa_booking_id: 24, date_from: s('2026-10-13'), date_to: s('2026-10-14'), qty: 1, total: 9, name: 'Halka', status: 'confirmed', source: 'online' },
      { id: 3, created_at: '2026-09-13T22:00:31.587Z', extra_id: 1, room_booking_id: 2, spa_booking_id: null, date_from: s('2026-10-14'), date_to: s('2026-10-15'), qty: 1, total: 18, name: 'Julia Fischer', status: 'confirmed', source: 'online' },
      { id: 146, created_at: '2026-10-10T22:00:41.428Z', extra_id: 3, room_booking_id: null, spa_booking_id: null, date_from: s('2026-10-13'), date_to: s('2026-10-15'), qty: 1, total: 58, name: 'Sophie Brandt', status: 'confirmed', source: 'desk' },
      { id: 147, created_at: '2026-10-10T22:00:41.468Z', extra_id: 4, room_booking_id: null, spa_booking_id: null, date_from: s('2026-10-12'), date_to: s('2026-10-15'), qty: 3, total: 171, name: 'Jonas Fischer', status: 'confirmed', source: 'desk' },
      { id: 160, created_at: '2026-10-11T10:00:00.000Z', extra_id: 4, room_booking_id: 40, spa_booking_id: null, date_from: s('2026-10-13'), date_to: s('2026-10-14'), qty: 1, total: 19, name: 'Nina Lorenz', status: 'confirmed', source: 'online' },
      { id: 100, created_at: '2026-09-03T22:00:38.227Z', extra_id: 1, room_booking_id: 76, spa_booking_id: null, date_from: s('2026-10-15'), date_to: s('2026-10-19'), qty: 2, total: 144, name: 'Stefan Wagner', status: 'confirmed', source: 'online' },
      { id: 148, created_at: '2026-10-10T22:00:41.504Z', extra_id: 3, room_booking_id: null, spa_booking_id: null, date_from: s('2026-10-15'), date_to: s('2026-10-16'), qty: 1, total: 29, name: 'Thomas Petersen', status: 'confirmed', source: 'desk' },
      { id: 126, created_at: '2026-09-12T22:00:40.028Z', extra_id: 1, room_booking_id: 95, spa_booking_id: null, date_from: s('2026-10-16'), date_to: s('2026-10-19'), qty: 4, total: 216, name: 'Elif Martin', status: 'confirmed', source: 'online' },
      { id: 127, created_at: '2026-09-12T22:00:40.064Z', extra_id: 2, room_booking_id: 95, spa_booking_id: null, date_from: s('2026-10-16'), date_to: s('2026-10-19'), qty: 1, total: 36, name: 'Elif Martin', status: 'confirmed', source: 'online' },
      { id: 149, created_at: '2026-10-10T22:00:41.543Z', extra_id: 3, room_booking_id: null, spa_booking_id: null, date_from: s('2026-10-16'), date_to: s('2026-10-17'), qty: 2, total: 58, name: 'Lukas Brandt', status: 'confirmed', source: 'desk' },
      { id: 4, created_at: '2026-09-22T22:00:31.706Z', extra_id: 1, room_booking_id: 4, spa_booking_id: null, date_from: s('2026-10-17'), date_to: s('2026-10-20'), qty: 1, total: 54, name: 'Elif Vogel', status: 'confirmed', source: 'online' },
      { id: 68, created_at: '2026-09-21T22:00:36.148Z', extra_id: 1, room_booking_id: 53, spa_booking_id: null, date_from: s('2026-10-17'), date_to: s('2026-10-18'), qty: 1, total: 18, name: 'Sophie Kraus', status: 'confirmed', source: 'online' },
      { id: 69, created_at: '2026-09-21T22:00:36.183Z', extra_id: 2, room_booking_id: 53, spa_booking_id: null, date_from: s('2026-10-17'), date_to: s('2026-10-18'), qty: 1, total: 12, name: 'Sophie Kraus', status: 'confirmed', source: 'online' },
      { id: 70, created_at: '2026-09-21T22:00:36.219Z', extra_id: 3, room_booking_id: 53, spa_booking_id: null, date_from: s('2026-10-17'), date_to: s('2026-10-18'), qty: 1, total: 29, name: 'Sophie Kraus', status: 'confirmed', source: 'online' },
      { id: 150, created_at: '2026-10-10T22:00:41.582Z', extra_id: 3, room_booking_id: null, spa_booking_id: null, date_from: s('2026-10-17'), date_to: s('2026-10-18'), qty: 1, total: 29, name: 'Sophie Lorenz', status: 'confirmed', source: 'desk' },
      { id: 151, created_at: '2026-10-10T22:00:41.617Z', extra_id: 4, room_booking_id: null, spa_booking_id: null, date_from: s('2026-10-17'), date_to: s('2026-10-18'), qty: 2, total: 38, name: 'Anna Petersen', status: 'confirmed', source: 'desk' },
      { id: 19, created_at: '2026-09-04T22:00:32.749Z', extra_id: 2, room_booking_id: 15, spa_booking_id: null, date_from: s('2026-10-18'), date_to: s('2026-10-20'), qty: 1, total: 24, name: 'Sophie Schmid', status: 'confirmed', source: 'online' },
      { id: 51, created_at: '2026-09-09T22:00:35.025Z', extra_id: 2, room_booking_id: 41, spa_booking_id: null, date_from: s('2026-10-18'), date_to: s('2026-10-22'), qty: 1, total: 48, name: 'Laura Schmid', status: 'confirmed', source: 'online' },
      { id: 73, created_at: '2026-09-14T22:00:36.363Z', extra_id: 3, room_booking_id: 54, spa_booking_id: null, date_from: s('2026-10-18'), date_to: s('2026-10-19'), qty: 1, total: 29, name: 'Sophie Berger', status: 'confirmed', source: 'online' },
      { id: 152, created_at: '2026-10-10T22:00:41.652Z', extra_id: 3, room_booking_id: null, spa_booking_id: null, date_from: s('2026-10-18'), date_to: s('2026-10-19'), qty: 1, total: 29, name: 'Sophie Weber', status: 'confirmed', source: 'desk' },
      { id: 153, created_at: '2026-10-10T22:00:41.687Z', extra_id: 4, room_booking_id: null, spa_booking_id: null, date_from: s('2026-10-18'), date_to: s('2026-10-19'), qty: 2, total: 38, name: 'Julia Hofmann', status: 'confirmed', source: 'desk' },
    ],
    spaBookings: [
      { id: 4, created_at: '2026-10-08T11:00:29.981Z', date: s('2026-10-12'), start_min: 540, end_min: 570, treatment_id: 3, therapist_id: 3, name: 'Nina R.', email: 'nina@example.com', phone: '+49 151 9376758', note: '', status: 'confirmed', source: 'online', lang: 'de' },
      { id: 3, created_at: '2026-10-11T15:00:29.943Z', date: s('2026-10-12'), start_min: 660, end_min: 705, treatment_id: 6, therapist_id: 2, name: 'Stefan P.', email: 'stefan@example.com', phone: '+49 151 7294683', note: '', status: 'confirmed', source: 'online', lang: 'de' },
      { id: 2, created_at: '2026-10-10T05:00:29.909Z', date: s('2026-10-12'), start_min: 870, end_min: 930, treatment_id: 1, therapist_id: 1, name: 'Peter G.', email: 'peter@example.com', phone: '+49 151 8252122', note: '', status: 'confirmed', source: 'online', lang: 'de' },
      { id: 1, created_at: '2026-10-09T04:00:29.822Z', date: s('2026-10-12'), start_min: 900, end_min: 990, treatment_id: 5, therapist_id: 3, name: 'David L.', email: '', phone: '+49 151 2345183', note: '', status: 'pending', source: 'phone', lang: 'de' },
      { id: 24, created_at: '2026-10-12T16:48:38.994Z', date: s('2026-10-13'), start_min: 570, end_min: 630, treatment_id: 1, therapist_id: 1, name: 'Halka', email: 'halka@gmail.com', phone: '+49 151 3918274', note: '', status: 'confirmed', source: 'online', lang: 'en' },
      { id: 6, created_at: '2026-10-08T12:00:30.055Z', date: s('2026-10-13'), start_min: 750, end_min: 810, treatment_id: 2, therapist_id: 3, name: 'Sophie A.', email: 'sophie@example.com', phone: '+49 151 8699141', note: '', status: 'confirmed', source: 'online', lang: 'de' },
      { id: 7, created_at: '2026-10-09T20:00:30.092Z', date: s('2026-10-13'), start_min: 930, end_min: 990, treatment_id: 1, therapist_id: 1, name: 'Hannah V.', email: 'hannah@example.com', phone: '+49 151 9850223', note: '', status: 'confirmed', source: 'online', lang: 'de' },
      { id: 5, created_at: '2026-10-11T16:00:30.018Z', date: s('2026-10-13'), start_min: 1020, end_min: 1080, treatment_id: 3, therapist_id: 2, name: 'Stefan P.', email: 'stefan@example.com', phone: '+49 151 4017853', note: '', status: 'pending', source: 'online', lang: 'de' },
      { id: 8, created_at: '2026-10-10T16:00:30.127Z', date: s('2026-10-14'), start_min: 540, end_min: 630, treatment_id: 5, therapist_id: 2, name: 'David L.', email: '', phone: '+49 151 9954264', note: '', status: 'confirmed', source: 'online', lang: 'de' },
      { id: 9, created_at: '2026-10-11T16:00:30.166Z', date: s('2026-10-14'), start_min: 570, end_min: 615, treatment_id: 6, therapist_id: 3, name: 'Lukas Z.', email: 'lukas@example.com', phone: '+49 151 1486457', note: '', status: 'confirmed', source: 'online', lang: 'de' },
      { id: 10, created_at: '2026-10-08T07:00:30.202Z', date: s('2026-10-14'), start_min: 720, end_min: 780, treatment_id: 1, therapist_id: 3, name: 'Peter G.', email: '', phone: '+49 151 7407238', note: '', status: 'confirmed', source: 'online', lang: 'de' },
      { id: 11, created_at: '2026-10-09T06:00:30.239Z', date: s('2026-10-14'), start_min: 750, end_min: 780, treatment_id: 3, therapist_id: 1, name: 'Sophie A.', email: 'sophie@example.com', phone: '+49 151 6657991', note: '', status: 'confirmed', source: 'online', lang: 'de' },
    ],
    treatments: [
      { id: 2, slug: 'thai', name_de: 'Traditionelle Thai-Massage', name_en: 'Traditional Thai massage', desc_de: 'Dehnung und Druckpunkte auf der Matte, in bequemer Kleidung.', desc_en: 'Stretching and pressure points on the mat, in comfortable clothes.', name_ru: 'Традиционный тайский массаж', desc_ru: 'Растяжка и точечное воздействие на мате, в удобной одежде.', minutes: 60, price: 79, image: 'https://demo.steyer.studio/stock/spa-stone.webp', active: true, sort: 0 },
      { id: 1, slug: 'aroma', name_de: 'Aromaöl-Massage', name_en: 'Aroma oil massage', desc_de: 'Sanfte Ganzkörpermassage mit warmem Öl nach Wahl.', desc_en: 'Gentle full-body massage with a warm oil of your choice.', name_ru: 'Аромамасляный массаж', desc_ru: 'Мягкий массаж всего тела тёплым маслом на выбор.', minutes: 60, price: 85, image: 'https://demo.steyer.studio/stock/spa-aroma.webp', active: true, sort: 1 },
      { id: 3, slug: 'back', name_de: 'Rücken und Nacken', name_en: 'Back and neck', desc_de: 'Gezielt für Schultern, Nacken und unteren Rücken.', desc_en: 'Focused on shoulders, neck and lower back.', name_ru: 'Спина и шея', desc_ru: 'Плечи, шея и поясница.', minutes: 30, price: 45, image: 'https://demo.steyer.studio/stock/spa-back.webp', active: true, sort: 2 },
      { id: 5, slug: 'stone', name_de: 'Hot-Stone-Massage', name_en: 'Hot stone massage', desc_de: 'Warme Basaltsteine lösen tiefe Verspannungen.', desc_en: 'Warm basalt stones ease deep tension.', name_ru: 'Массаж горячими камнями', desc_ru: 'Тёплые базальтовые камни снимают глубокое напряжение.', minutes: 90, price: 119, image: 'https://demo.steyer.studio/stock/spa-oil.webp', active: true, sort: 3 },
      { id: 6, slug: 'foot', name_de: 'Fußreflexzonen', name_en: 'Foot reflexology', desc_de: 'Druck auf die Reflexzonen der Füße, im Sessel.', desc_en: 'Pressure on the reflex zones of the feet, in a chair.', name_ru: 'Рефлексотерапия стоп', desc_ru: 'Воздействие на рефлекторные зоны стоп, в кресле.', minutes: 45, price: 59, image: 'https://demo.steyer.studio/stock/spa-foot.webp', active: true, sort: 4 },
      { id: 7, slug: 'couple', name_de: 'Paarmassage', name_en: 'Couples massage', desc_de: 'Zwei Liegen, zwei Therapeutinnen, ein Raum.', desc_en: 'Two tables, two therapists, one room.', name_ru: 'Массаж для двоих', desc_ru: 'Две кушетки, два терапевта, одна комната.', minutes: 60, price: 159, image: 'https://demo.steyer.studio/stock/extra-spa.webp', active: true, sort: 5 },
    ],
    therapists: [
      { id: 1, name: 'Mali' },
      { id: 2, name: 'Nok' },
      { id: 3, name: 'Anna' },
    ],
    blocks: [
      { id: 2, date: s('2026-10-12'), start_min: 780, end_min: 840, therapist_id: null, reason: 'Teammeeting / Team meeting' },
      { id: 1, date: s('2026-10-13'), start_min: 780, end_min: 1080, therapist_id: 2, reason: 'Frei / Day off' },
    ],
    posts: [
      { id: 5, created_at: '2026-10-10T22:00:42.397Z', kind: 'event', slug: 'winterpakete', status: 'draft', title_de: 'Winterpakete 2027', title_en: 'Winter packages 2027', title_ru: 'Зимние пакеты 2027', excerpt_de: 'Entwurf: Kaminabende, Glühwein und zwei Nächte mit Spa.', excerpt_en: 'Draft: fireside evenings, mulled wine and two nights with spa.', excerpt_ru: 'Черновик: вечера у камина, глинтвейн и две ночи со спа.', body_de: '<p>Entwurf, noch nicht veröffentlicht.</p>', body_en: '<p>Draft, not published yet.</p>', body_ru: '<p>Черновик, ещё не опубликован.</p>', image: 'https://demo.steyer.studio/stock/post-winter.webp', event_date: '2026-12-11', event_time: '', location: '', capacity: null, published_at: null },
      { id: 2, created_at: '2026-10-08T22:00:42.290Z', kind: 'event', slug: 'saunanacht', status: 'published', title_de: 'Saunanacht mit Aufgüssen', title_en: 'Sauna night with infusions', title_ru: 'Ночь сауны с парением', excerpt_de: 'Vier Aufgüsse bis Mitternacht, Pool und Ruheraum bleiben offen.', excerpt_en: 'Four infusions until midnight, pool and relaxation room stay open.', excerpt_ru: 'Четыре парения до полуночи, бассейн и зона отдыха открыты.', body_de: '<p>Einmal im Monat bleibt das Spa bis Mitternacht offen. Unser Saunameister macht vier Aufgüsse mit Ölen aus der Region.</p>', body_en: '<p>Once a month the spa stays open until midnight. Our sauna master does four infusions with oils from the region.</p><p>Bathrobe and tea are included.</p>', body_ru: '<p>Раз в месяц спа работает до полуночи.</p>', image: 'https://demo.steyer.studio/stock/post-pool.webp', event_date: s('2026-10-28'), event_time: '20:00', location: 'Spa', capacity: 16, published_at: '2026-10-08T22:00:42.290Z' },
      { id: 3, created_at: '2026-10-06T22:00:42.329Z', kind: 'blog', slug: 'fruehstueck-bis-elf', status: 'published', title_de: 'Neu: Frühstück bis 11 Uhr', title_en: 'New: breakfast until 11 am', title_ru: 'Новое: завтрак до 11:00', excerpt_de: 'Länger schlafen, trotzdem frühstücken. Und es gibt neue Gerichte.', excerpt_en: 'Sleep in and still have breakfast. With some new dishes, too.', excerpt_ru: 'Поспать подольше и успеть на завтрак.', body_de: '<p>Ab sofort gibt es Frühstück bis 11 Uhr, am Wochenende sogar bis 11:30 Uhr.</p>', body_en: '<p>From now on breakfast runs until 11 am, at weekends even until 11:30.</p><h2>New on the menu</h2><p>Pancakes with berries, shakshuka and a bowl with vegetables from the farm next door.</p>', body_ru: '<p>Теперь завтрак до 11:00.</p>', image: 'https://demo.steyer.studio/stock/post-food.webp', event_date: null, event_time: '', location: '', capacity: null, published_at: '2026-10-06T22:00:42.329Z' },
      { id: 1, created_at: '2026-10-05T22:00:42.063Z', kind: 'event', slug: 'weinabend-terrasse', status: 'published', title_de: 'Weinabend auf der Terrasse', title_en: 'Wine evening on the terrace', title_ru: 'Винный вечер на террасе', excerpt_de: 'Sechs Weine aus dem Tal, dazu kleine Gerichte aus unserer Küche.', excerpt_en: 'Six wines from the valley, with small dishes from our kitchen.', excerpt_ru: 'Шесть вин из долины и закуски от нашей кухни.', body_de: '<p>Unsere Winzerin aus dem Nachbarort bringt sechs Weine mit.</p>', body_en: '<p>Our winemaker from the next village brings six wines, from light to full-bodied, paired with small dishes from the hotel kitchen.</p>', body_ru: '<p>Винодел из соседней деревни привезёт шесть вин.</p>', image: 'https://demo.steyer.studio/stock/post-wine.webp', event_date: s('2026-10-21'), event_time: '19:00', location: 'Terrasse', capacity: 24, published_at: '2026-10-05T22:00:42.063Z' },
      { id: 4, created_at: '2026-09-29T22:00:42.363Z', kind: 'blog', slug: 'radtouren', status: 'published', title_de: 'Drei Radtouren ab dem Hotel', title_en: 'Three bike tours from the hotel', title_ru: 'Три велопрогулки от отеля', excerpt_de: 'Von 18 bis 45 Kilometern, mit E-Bike auch für Ungeübte.', excerpt_en: 'From 18 to 45 kilometres, easy for beginners on an e-bike.', excerpt_ru: 'От 18 до 45 километров.', body_de: '<p>Unsere drei Lieblingstouren starten direkt vor der Tür.</p>', body_en: '<p>Our three favourite tours start right at the door. Rent e-bikes at the front desk or add them to your booking.</p>', body_ru: '<p>Три наших любимых маршрута начинаются прямо у входа.</p>', image: 'https://demo.steyer.studio/stock/extra-ebike.webp', event_date: null, event_time: '', location: '', capacity: null, published_at: '2026-09-29T22:00:42.363Z' },
    ],
    signups: [
      { id: 5, created_at: '2026-10-11T19:00:42.256Z', post_id: 1, name: 'Peter Lorenz', persons: 2, email: 'peter@example.com', status: 'confirmed', lang: 'de' },
      { id: 4, created_at: '2026-10-11T14:00:42.220Z', post_id: 1, name: 'Clara Weber', persons: 2, email: 'clara@example.com', status: 'confirmed', lang: 'de' },
      { id: 3, created_at: '2026-10-10T16:00:42.185Z', post_id: 1, name: 'Familie Novak', persons: 3, email: 'novak@example.com', status: 'confirmed', lang: 'de' },
      { id: 2, created_at: '2026-10-09T00:00:42.151Z', post_id: 1, name: 'Jonas Berger', persons: 4, email: 'jonas@example.com', status: 'confirmed', lang: 'de' },
      { id: 1, created_at: '2026-10-06T22:00:42.108Z', post_id: 1, name: 'Katrin Albers', persons: 2, email: 'katrin@example.com', status: 'confirmed', lang: 'de' },
    ],
    vouchers: [
      { id: 7, created_at: '2026-10-10T22:00:42.827Z', code: 'DEM-J4LS-8EVN', offer: 'value', value: 150, balance: 150, recipient: 'Clara', message: '', buyer: 'Mia Fischer', email: 'mia@example.com', delivery: 'email', status: 'active', expires: '2029-12-31', source: 'online', lang: 'en' },
      { id: 6, created_at: '2026-10-09T22:00:42.789Z', code: 'DEM-W9TM-3CRH', offer: 'spa', value: 169, balance: 169, recipient: 'Sophie', message: 'Für dich.', buyer: 'David Lorenz', email: 'david@example.com', delivery: 'email', status: 'active', expires: '2029-12-31', source: 'online', lang: 'de' },
      { id: 4, created_at: '2026-09-29T22:00:42.635Z', code: 'DEM-5ZGY-K7PA', offer: 'value', value: 50, balance: 50, recipient: '', message: '', buyer: 'Thomas Brandt', email: 'thomas@example.com', delivery: 'email', status: 'active', expires: '2029-12-31', source: 'desk', lang: 'de' },
      { id: 2, created_at: '2026-09-18T22:00:42.521Z', code: 'DEM-3HNP-9WTC', offer: 'spa', value: 169, balance: 169, recipient: 'Mama und Papa', message: 'Zum Hochzeitstag.', buyer: 'Jonas Berger', email: 'jonas@example.com', delivery: 'email', status: 'active', expires: '2029-12-31', source: 'online', lang: 'de' },
      { id: 8, created_at: '2026-09-11T22:00:42.864Z', code: 'DEM-B6YK-4QZM', offer: 'value', value: 75, balance: 75, recipient: '', message: '', buyer: 'Peter Vogel', email: 'peter@example.com', delivery: 'email', status: 'cancelled', expires: '2029-12-31', source: 'online', lang: 'de' },
      { id: 1, created_at: '2026-08-31T22:00:42.436Z', code: 'DEM-7KQ2-M4XD', offer: 'value', value: 100, balance: 60, recipient: 'Anna', message: 'Alles Gute zum Geburtstag!', buyer: 'Laura Keller', email: 'laura@example.com', delivery: 'email', status: 'active', expires: '2029-12-31', source: 'online', lang: 'de' },
      { id: 5, created_at: '2026-08-17T22:00:42.673Z', code: 'DEM-N2DF-6XUB', offer: 'value', value: 250, balance: 106, recipient: 'Team Marketing', message: 'Danke für ein tolles Jahr.', buyer: 'Sabine Hofmann', email: 'sabine@example.com', delivery: 'email', status: 'active', expires: '2029-12-31', source: 'online', lang: 'de' },
      { id: 3, created_at: '2026-08-02T22:00:42.556Z', code: 'DEM-Q8RV-2LJE', offer: 'stay', value: 179, balance: 0, recipient: 'Familie Novak', message: '', buyer: 'Elif Yilmaz', email: 'elif@example.com', delivery: 'email', status: 'redeemed', expires: '2029-12-31', source: 'online', lang: 'de' },
    ],
    redemptions: [
      { id: 1, created_at: '2026-09-07T22:00:42.474Z', voucher_id: 1, amount: 40, note: 'Spa' },
      { id: 4, created_at: '2026-08-31T22:00:42.750Z', voucher_id: 5, amount: 59, note: 'Restaurant' },
      { id: 3, created_at: '2026-08-24T22:00:42.713Z', voucher_id: 5, amount: 85, note: 'Spa' },
      { id: 2, created_at: '2026-08-09T22:00:42.592Z', voucher_id: 3, amount: 179, note: 'Spa' },
    ],
    faq: [
      { id: 1, question: 'When is check-in and check-out?', answer: 'Check-in from 3 pm, check-out until 11 am. Late check-out until 2 pm costs €30 and can be added when booking.', sort: 0 },
      { id: 2, question: 'When is breakfast served?', answer: 'Breakfast buffet daily from 7 to 11 am, on weekends until 11:30 am. €18 per person, selectable as an extra.', sort: 1 },
      { id: 3, question: 'Are dogs allowed?', answer: 'Yes, one dog per room is welcome, €15 per night, ideally in the garden double room with terrace.', sort: 2 },
      { id: 4, question: 'Is there parking available?', answer: 'Yes, 8 spaces in the underground garage with EV charging station, €12 per night.', sort: 3 },
      { id: 5, question: 'What are the spa opening hours?', answer: 'Treatments Monday to Saturday from 9 am to 8 pm. Sauna and pool are open daily for hotel guests from 7 am to 9 pm.', sort: 4 },
      { id: 6, question: 'Can day guests visit the spa?', answer: 'Yes. Treatments can be booked online by anyone. A day pass for sauna and pool costs €35 at the front desk.', sort: 5 },
    ],
    conciergeLog: [
      { id: 7, created_at: '2026-10-11T19:00:43.773Z', day: s('2026-10-11'), lang: 'en', question: 'Do you have vegan options at breakfast?', answer: 'I do not have information on that. Shall I pass the question on to the team?', status: 'unanswered', tools: 'no_answer', tokens_in: 6200, tokens_out: 48, model: 'demo' },
      { id: 6, created_at: '2026-10-11T14:00:43.738Z', day: s('2026-10-11'), lang: 'de', question: 'Darf ich mein eigenes Fahrrad im Zimmer abstellen?', answer: 'Dazu habe ich keine Information. Soll ich die Frage an das Team weitergeben?', status: 'handoff', tools: 'no_answer', tokens_in: 6400, tokens_out: 55, model: 'demo' },
      { id: 5, created_at: '2026-10-11T02:00:43.685Z', day: s('2026-10-11'), lang: 'ru', question: 'Есть ли свободное время для массажа завтра?', answer: 'Да, завтра свободно в 10:00, 11:30 и 15:00. Я подготовил запись.', status: 'answered', tools: 'spa_times, propose_booking', tokens_in: 7900, tokens_out: 140, model: 'demo' },
      { id: 3, created_at: '2026-10-10T16:00:43.583Z', day: s('2026-10-10'), lang: 'de', question: 'Kann man bei euch E-Autos laden?', answer: 'In der Tiefgarage gibt es Ladestationen, der Platz kostet 12 € pro Nacht.', status: 'answered', tools: '', tokens_in: 6100, tokens_out: 60, model: 'demo' },
      { id: 2, created_at: '2026-10-10T00:00:43.548Z', day: s('2026-10-10'), lang: 'en', question: 'Is breakfast included?', answer: 'Breakfast is not included in the room price. It is 18 € per person and can be added when you book.', status: 'answered', tools: '', tokens_in: 6200, tokens_out: 70, model: 'demo' },
    ],
    concierge: { ai: false, model: '', perDay: 300, perVisitor: 20 },
    checkins: [
      { id: 1, created_at: '2026-10-11T19:00:42.938Z', room_booking_id: 14, first_name: 'Julia', last_name: 'Fischer', birth_date: '1986-04-12', nationality: 'AT', street: 'Mariahilfer Straße 12', zip: '1070', city: 'Wien', country: 'AT', doc_type: 'passport', doc_number: 'P1234567', companions: '', arrival: '15-17', note: '', lang: 'de' },
      { id: 2, created_at: '2026-10-11T12:00:42.975Z', room_booking_id: 69, first_name: 'Thomas', last_name: 'Roth', birth_date: '1979-09-30', nationality: 'DE', street: 'Lindenstraße 4', zip: '80331', city: 'München', country: 'DE', doc_type: '', doc_number: '', companions: '', arrival: '17-19', note: '', lang: 'de' },
      { id: 3, created_at: '2026-10-11T05:00:43.013Z', room_booking_id: 2, first_name: 'Julia', last_name: 'Fischer', birth_date: '1991-01-05', nationality: 'CH', street: 'Bahnhofstrasse 21', zip: '8001', city: 'Zürich', country: 'CH', doc_type: 'id', doc_number: 'C9876543', companions: '', arrival: '19-21', note: '', lang: 'de' },
    ],
    enquiries: [
      { id: 4, created_at: '2026-10-11T20:00:42.026Z', topic: 'other', details: '[]', name: 'Bernd Kühn', channel: 'email', contact: 'b.kuehn@example.com', message: 'Sind Hunde im Zimmer erlaubt?', status: 'new', lang: 'de' },
      { id: 3, created_at: '2026-10-11T17:00:41.981Z', topic: 'voucher', details: '[["Type","Spa day"],["Amount","150 €"],["Delivery","Email as PDF"]]', name: 'Emma Clarke', channel: 'whatsapp', contact: '+44 7700 900000', message: 'A birthday present for my sister.', status: 'new', lang: 'en' },
      { id: 1, created_at: '2026-10-10T16:00:41.881Z', topic: 'event', details: '[["Anlass","Hochzeit"],["Zeitraum","Juni 2027"],["Gäste","50–100"],["Übernachtung","Ja"]]', name: 'Katrin Albers', channel: 'email', contact: 'k.albers@example.com', message: 'Wir suchen eine Location für Trauung im Garten und Feier am Abend.', status: 'open', lang: 'de' },
      { id: 2, created_at: '2026-10-09T18:00:41.941Z', topic: 'group', details: '[["Art","Seminar oder Tagung"],["Zeitraum","März 2027"],["Personen","10–20"],["Tagungsraum","Ja"]]', name: 'Ralf Ostermann', channel: 'phone', contact: '+49 151 0000 0000', message: 'Zwei Tage Strategie-Workshop mit Übernachtung.', status: 'done', lang: 'de' },
    ],
    resetAt: new Date().toISOString(),
  };
}

const g = globalThis as unknown as {
  __steyerAdminState?: SteyerAdminState;
};

const STORAGE_FILE = path.join(process.cwd(), '.next', 'cache', 'steyer-admin-state.json');

export function getSteyerState(): SteyerAdminState {
  const today = getTodayIso();
  if (g.__steyerAdminState && g.__steyerAdminState.today === today) {
    return g.__steyerAdminState;
  }

  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const raw = fs.readFileSync(STORAGE_FILE, 'utf8');
      const parsed = JSON.parse(raw) as SteyerAdminState;
      if (parsed && parsed.today === today) {
        g.__steyerAdminState = parsed;
        return parsed;
      }
    }
  } catch {}

  const fresh = createInitialSeed();
  g.__steyerAdminState = fresh;
  saveSteyerState(fresh);
  return fresh;
}

export function saveSteyerState(state: SteyerAdminState): void {
  g.__steyerAdminState = state;
  try {
    const dir = path.dirname(STORAGE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(state));
  } catch {}
}

export function resetSteyerState(): SteyerAdminState {
  const fresh = createInitialSeed();
  saveSteyerState(fresh);
  return fresh;
}
