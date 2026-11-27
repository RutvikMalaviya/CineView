import type { Request, Response } from "express";
import { Router } from "express";
import { z } from "zod";
import { HTTP_STATUS } from "../../shared/constants/http-status";
import { validateRequest } from "../../shared/middlewares/validate.middleware";
import { asyncHandler } from "../../shared/utils/async-handler";
import { sendSuccess } from "../../shared/utils/response";
import { recordWebhookEvent } from "./payments.service";

const webhookSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  data: z.record(z.unknown()).default({}),
});

export const paymentsRouter = Router();

paymentsRouter.post(
  "/webhook",
  validateRequest({ body: webhookSchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const signature = req.header("stripe-signature") ?? "";
    const body = req.body as z.infer<typeof webhookSchema>;
    const result = await recordWebhookEvent({
      eventId: body.id,
      eventType: body.type,
      payloadString: JSON.stringify(req.body),
      signatureHeader: signature,
      payload: body,
    });
    sendSuccess(res, HTTP_STATUS.OK, "responses.success", { received: true, ...result });
  }),
);
