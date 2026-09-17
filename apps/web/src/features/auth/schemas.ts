import { z } from 'zod';

const frenchEmail = z.string().trim().email('Saisis une adresse email valide.');
const password = z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères.');

export const loginSchema = z.object({ email: frenchEmail, password });
export type LoginValues = z.infer<typeof loginSchema>;

export const structureStepOneSchema = z.object({
  siret: z.string().regex(/^\d{14}$/, 'Le SIRET doit contenir exactement 14 chiffres.').refine((value) => {
    const checksum = value.split('').reduce((sum, digit, index) => {
      const number = Number(digit) * (index % 2 === 0 ? 2 : 1);
      return sum + (number > 9 ? number - 9 : number);
    }, 0);
    return checksum % 10 === 0;
  }, 'Ce SIRET ne passe pas la clé de contrôle.')
});
export type StructureStepOneValues = z.infer<typeof structureStepOneSchema>;

export const structureStepTwoSchema = z.object({ schoolId: z.string().min(1, 'Sélectionne une école dans les résultats.'), hasPedt: z.boolean() });
export type StructureStepTwoValues = z.infer<typeof structureStepTwoSchema>;

export const structureStepThreeSchema = z.object({
  childrenUnder6: z.coerce.number().int().min(0, 'Saisis un effectif positif ou nul.'),
  children6AndOver: z.coerce.number().int().min(0, 'Saisis un effectif positif ou nul.'),
  durationHours: z.coerce.number().positive('La durée doit être supérieure à 0.'),
});
export type StructureStepThreeValues = z.infer<typeof structureStepThreeSchema>;
export type StructureStepThreeInput = z.input<typeof structureStepThreeSchema>;

const fileValue = z.custom<File>((value) => typeof File !== 'undefined' && value instanceof File, 'Ajoute une pièce justificative.');
export const animatorRegistrationSchema = z.object({
  firstName: z.string().trim().min(2, 'Le prénom est obligatoire.'),
  lastName: z.string().trim().min(2, 'Le nom est obligatoire.'),
  email: frenchEmail,
  postalCode: z.string().regex(/^\d{5}$/, 'Le code postal doit contenir 5 chiffres.'),
  city: z.string().trim().min(2, 'La commune est obligatoire.'),
  travelRadiusKm: z.coerce.number().int().min(1, 'Le rayon doit être supérieur à 0.').max(100, 'Le rayon ne peut pas dépasser 100 km.'),
  qualificationLevel: z.enum(['QUALIFIED', 'TRAINEE', 'UNQUALIFIED'], { message: 'Choisis un niveau de qualification.' }),
  masteredAgeGroups: z.array(z.enum(['UNDER_6', 'SIX_AND_OVER'])).min(1, 'Choisis au moins une tranche d’âge.'),
  experienceYears: z.coerce.number().int().min(0, 'L’expérience ne peut pas être négative.'),
  honorabilityDocument: fileValue,
  honorabilityCheckedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Indique la date de vérification.'),
  identityDocument: fileValue,
  identityExpiresAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Indique la date d’expiration.'),
  password,
});
export type AnimatorRegistrationValues = z.infer<typeof animatorRegistrationSchema>;
export type AnimatorRegistrationInput = z.input<typeof animatorRegistrationSchema>;

export function getFieldErrors(error: z.ZodError): Record<string, string> {
  return error.issues.reduce<Record<string, string>>((errors, issue) => { const key = String(issue.path[0] ?? 'form'); if (!errors[key]) errors[key] = issue.message; return errors; }, {});
}