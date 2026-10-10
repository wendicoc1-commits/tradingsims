import { z } from 'zod';

export const OrderInputSchema = z.object({
  symbol: z
    .string()
    .min(1, 'Simbol emiten tidak boleh kosong')
    .max(20, 'Simbol maksimal 20 karakter')
    .toUpperCase(),
  price: z
    .number({ invalid_type_error: 'Harga harus berupa angka' })
    .positive('Harga harus bernilai positif lebih dari 0'),
  lots: z
    .number({ invalid_type_error: 'Volume harus berupa angka' })
    .positive('Volume harus lebih dari 0')
    .max(1_000_000, 'Volume order melebihi batas wajar simulasi (maks 1.000.000)'),
  assetClass: z.enum(['EQUITY', 'CRYPTO', 'US']).default('EQUITY'),
  orderType: z.enum(['LIMIT', 'MARKET']).default('LIMIT'),
});

export type OrderInput = z.infer<typeof OrderInputSchema>;

export const UserProfileSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  fullName: z.string().min(2, 'Nama minimal 2 karakter').max(100),
});
