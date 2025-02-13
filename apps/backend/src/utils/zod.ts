import { z } from 'zod';

export const handleZodParse = <SchemaType extends z.ZodTypeAny>(
  zodSchema: SchemaType,
  data: unknown,
  isZodHardParse = false
): z.output<SchemaType> => {
  const result = zodSchema.safeParse(data);

  if (!result.success) {
    console.group('Zod Schema Validation Failed');
    console.warn(
      'Input data (truncated to 2000 characters):',
      JSON.stringify(data).slice(0, 2000)
    );
    console.error('Error details:', result.error);
    console.groupEnd();
  }

  if (isZodHardParse) {
    throw Error(`Unable to parse JSON given a zod schema: ${result.error}`);
  }
  return data as z.output<SchemaType>;
};
