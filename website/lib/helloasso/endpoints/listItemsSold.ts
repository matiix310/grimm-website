import { FetchSchemaRoutes } from "@better-fetch/fetch";
import z, { number } from "zod";

const tierTypes = z.enum([
  "Donation",
  "Payment",
  "Registration",
  "Membership",
  "MonthlyDonation",
  "MonthlyPayment",
  "OfflineDonation",
  "Contribution",
  "Bonus",
  "Product",
]);

const itemStates = z.enum([
  "Waiting",
  "Processed",
  "Registered",
  "Deleted",
  "Unknown",
  "Canceled",
  "Refused",
  "Abandoned",
]);

const schema = {
  "/organizations/bde-epita/forms/Event/:eventSlug/items": {
    params: z.object({
      eventSlug: z.string(),
    }),
    query: z
      .object({
        from: z.date().optional(),
        to: z.date().optional(),
        userSearchKey: z.string().optional(),
        pageIndex: z.number().optional(),
        pageSize: z.number().optional(),
        continuationToken: z.string().optional(),
        tierTypes: z
          .array(tierTypes)
          .transform((a) => a.join(","))
          .optional(),
        itemStates: z
          .array(itemStates)
          .transform((a) => a.join(","))
          .optional(),
        tierName: z.string().optional(),
        withDetails: z.boolean().optional(),
        sortOrder: z.enum(["Asc", "Desc"]).optional(),
        sortField: z.enum(["Date", "UpdateDate", "CreationDate"]).optional(),
      })
      .optional(),
    output: z.object({
      data: z
        .array(
          z.object({
            payments: z.array(z.any()).optional(),
            discount: z
              .object({
                code: z.string().optional(),
                amount: number(),
              })
              .optional(),
            order: z.object({
              id: z.number(),
              date: z.coerce.date(),
              formSlug: z.string(),
              formType: z.string(),
              organizationName: z.string(),
              organizationSlug: z.string(),
              organizationType: z.string(),
              organizationIsUnderColucheLaw: z.boolean(),
              formName: z.string(),
              meta: z.object({
                createdAt: z.coerce.date(),
                updatedAt: z.coerce.date(),
              }),
              isAnonymous: z.boolean(),
              isAmountHidden: z.boolean(),
            }),
            payer: z.object({
              email: z.email(),
              country: z.string(),
              firstName: z.string(),
              lastName: z.string(),
            }),
            name: z.string(),
            user: z.object({
              firstName: z.string(),
              lastName: z.string(),
            }),
            priceCategory: z.enum(["Fixed", "Pwyw", "Free"]),
            customFields: z
              .array(
                z.object({
                  id: z.number(),
                  name: z.string(),
                  type: z.enum([
                    "Date",
                    "TextInput",
                    "FreeText",
                    "ChoiceList",
                    "File",
                    "YesNo",
                    "Phone",
                    "Zipcode",
                    "Number",
                  ]),
                  answer: z.string(),
                }),
              )
              .optional(),
            ticketUrl: z.string().optional(),
            qrCode: z.string().optional(),
            tierDescription: z.string().optional(),
            tierId: z.number().optional(),
            id: z.number(),
            amount: z.number(),
            type: tierTypes,
            initialAmount: z.number().optional(),
            state: itemStates,
          }),
        )
        .optional(),
      pagination: z.object({
        pageSize: z.number(),
        totalCount: z.number(),
        pageIndex: z.number(),
        totalPages: z.number(),
        continuationToken: z.string().nullable(),
      }),
    }),
  },
} as const satisfies FetchSchemaRoutes;

export default schema;
