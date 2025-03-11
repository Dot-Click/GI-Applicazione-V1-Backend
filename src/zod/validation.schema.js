import { z } from "zod";

export const createOrder = z.object({
  code: z.string().regex(/^COM-\d{6}$/, "Invalid format - correct code: COM-123456").transform((val, ctx) => {
    // Check if the operation is an update (i.e., `ctx.parent` has an existing value)
    if (ctx.parent?.code && val !== ctx.parent.code) {
      throw new Error("The 'code' field is non-editable");
    }
    return val;
  }),
  description: z.string().max(255),
  startDate: z.string().date("pagal hai kya?"),
  endDate: z.string().date(),
  address: z.string().max(255),
  cig: z.string(),
  cup: z.string(),
  siteManager: z.string(),
  orderManager: z.string(),
  technicalManager: z.string(),
  cnceCode: z.string(),
  workAmount: z.string(),
  advancePayment: z.string(),
  dipositRecovery: z.string(),
  iva: z.string(),
  withholdingAmount: z.string(),
  archieved: z.coerce.boolean().optional(),
  isPublic: z.coerce.boolean().optional(),
  contract: z.any().optional(),
  permission_to_build: z.any().optional(),
  desc_permission_to_build: z.string().optional(),
  desc_contract: z.string().optional(),
  psc: z.any().optional(),
  desc_psc: z.string().optional(),
  pos: z.any().optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  desc_pos: z.string().optional(),
  state: z
    .enum(["ON_HOLD", "IN_PROGRESS", "COMPLETATO", "CANCELLED"])
    .optional(),
});

export const createCustomer = z.object({
  companyName: z.string().max(255),
  vat: z.string(),
  taxId: z.string().transform((val) => {
    if (val) {
      throw new Error("The 'taxId' field is non-editable");
    }
    return val;
  }),
  nation: z.string(),
  province: z.string(),
  address: z.string(),
  common: z.string(),
  cap: z.string(),
  pec: z.string().email().transform((val) => {
    if (val) {
      throw new Error("The 'pec' field is non-editable");
    }
    return val;
  }),
  telephone: z.string().regex(/^\+\d{1,3}\s\(\d{3}\)\s\d{4}\s\d{4}$/,"Invalid format - telephone: +1 (235) 4563 2546"),
  email: z.string().email().transform((val) => {
    if (val) {
      throw new Error("The 'email' field is non-editable");
    }
    return val;
  }),
  password: z.string().optional()  
})

export const createSupplier = z.object({
  companyName: z.string().max(255),
  vat: z.string(),
  taxId: z.string().transform((val) => {
    if (val) {
      throw new Error("The 'taxId' field is non-editable");
    }
    return val;
  }),
  nation: z.string(),
  province: z.string(),
  address: z.string(),
  common: z.string(),
  cap: z.string(),
  pec: z.string().email().transform((val) => {
    if (val) {
      throw new Error("The 'pec' field is non-editable");
    }
    return val;
  }),
  telephone: z.string().regex(/^\+\d{1,3}\s\(\d{3}\)\s\d{4}\s\d{4}$/,"Invalid format - telephone: +1 (235) 4563 2546"),
  email: z.string().email().transform((val) => {
    if (val) {
      throw new Error("The 'email' field is non-editable");
    }
    return val;
  }),
  password: z.string().optional()  
})