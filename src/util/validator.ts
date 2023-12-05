import { ObjectSchema } from 'joi'

export async function joiValidate<T>(schema: ObjectSchema<T>, data: any): Promise<T> {
    return await schema.validateAsync(data)
}
