import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  phone: z.string().trim().max(40).optional(),
  city: z.string().trim().max(100).optional(),
  preferredFormat: z
    .enum(["IMAX with Laser", "Dolby Cinema", "70mm Film", "ScreenX 270°", "Standard 2D"])
    .optional(),
  preferredRowZone: z.enum(["front", "center", "rear"]).optional(),
  accessibilityNeeds: z.boolean().optional(),
  savedCinemaIds: z.array(z.string().min(1).max(60)).max(50).optional(),
  notifications: z
    .object({
      showtimeAlerts: z.boolean(),
      premiereInvites: z.boolean(),
      smsTicketUpdates: z.boolean(),
    })
    .optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
