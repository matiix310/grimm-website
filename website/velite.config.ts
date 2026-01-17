import { defineConfig, s } from "velite";

export default defineConfig({
  collections: {
    events: {
      name: "Events",
      pattern: "events/**/*.md",
      schema: s
        .object({
          title: s.string().max(99),
          slug: s.slug("events"),
          starting_date: s.isodate(),
          ending_date: s.isodate().optional(), // if none, only the starting date is used
          cover: s.image(),
          tags: s.array(s.string()),
          location: s.string(),
          location_link: s
            .string()
            .regex(/https?:\/\/.*/)
            .optional(),
          ticket_opening_date: s.isodate().optional(),
          ticket_closing_date: s.isodate().optional(),
          ticket_link: s
            .string()
            .regex(/https?:\/\/.*/)
            .optional(),

          // automatically added
          metadata: s.metadata(), // extract markdown reading-time, word-count, etc.
          excerpt: s.excerpt(), // excerpt of markdown content
          content: s.markdown(), // transform markdown to html
        })
        // dates
        .refine(
          ({ starting_date, ending_date }) => {
            // only starting_date => valid
            if (ending_date === undefined) return true;
            // starting_date must be before ending_date
            return starting_date <= ending_date;
          },
          { message: "starting_date must be before ending_date" },
        )
        // ticket
        .refine(
          ({ ticket_opening_date, ticket_closing_date }) => {
            // both undefined => valid
            if (ticket_opening_date === undefined && ticket_closing_date === undefined)
              return true;
            // one of them is undefined => invalid
            if (ticket_opening_date === undefined || ticket_closing_date === undefined)
              return false;
            // opening date must be before closing date
            return ticket_opening_date <= ticket_closing_date;
          },
          { message: "ticket_opening_date must be before ticket_closing_date" },
        )
        .refine(
          ({ ticket_link, ticket_opening_date }) => {
            // ticket link optional => valid
            if (ticket_link === undefined) return true;
            // no ticket_opening_date => invalid
            if (ticket_opening_date === undefined) return false;
            return true;
          },
          { message: "ticket_link can only be supplied if ticket_opening_date is set" },
        ),
    },
  },
});
