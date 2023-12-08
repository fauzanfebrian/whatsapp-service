import Joi, { ObjectSchema } from 'joi'

export async function joiValidate<T>(schema: ObjectSchema<T>, data: any): Promise<T> {
    return await schema.validateAsync(data)
}

export async function joiValidateNumber(val: any): Promise<number> {
    val = +val

    const schema = Joi.object({
        val: Joi.number().required(),
    })
    await schema.validateAsync({
        val,
    })

    return val
}
