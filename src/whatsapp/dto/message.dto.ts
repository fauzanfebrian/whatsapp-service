interface SendDto {
    sendTo: string
}

export interface SendTextDto extends SendDto {
    message: string
}

export interface SendContactDto extends SendDto {
    name: string
    phoneNumber: string
}

export interface SendLocationDto extends SendDto {
    lat: number
    long: number
}

export interface SendFileDto extends SendDto {
    caption?: string
    file: Buffer
    fileName: string
    mimetype: string
}
