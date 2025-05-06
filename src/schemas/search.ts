import { z } from "zod";

// Schema for advanced search term
export const advancedSearchTermSchema = z.object({
  term: z.string().min(1, "O termo de pesquisa não pode ser vazio"),
  id: z.string(),
});

// Schema for advanced search form
export const advancedSearchSchema = z
  .object({
    advancedTerms: z.array(advancedSearchTermSchema).default([]),
    operator: z.enum(["AND", "OR"] as const).default("AND"),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    boNumber: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // Se tem número de BO, não precisa validar os termos
    if (data.boNumber && data.boNumber.trim() !== "") {
      return; // Validação passa se tiver número de BO
    }

    // Se não tem número de BO, então deve ter pelo menos um termo válido
    const hasValidTerm =
      data.advancedTerms &&
      data.advancedTerms.some((term) => term.term.trim() !== "");

    if (!hasValidTerm) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Adicione pelo menos um termo de pesquisa ou um número de BO",
        path: ["root"], // Isso evita que a mensagem apareça especificamente nos advancedTerms
      });
    }
  });

// Combined schema for all search parameters
export const searchParamsSchema = z.object({
  boNumber: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  advancedTerms: z.array(advancedSearchTermSchema).optional(),
  operator: z.enum(["AND", "OR"] as const).optional(),
});
