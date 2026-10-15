const localDateBrand: unique symbol = Symbol("LocalDate")

export type LocalDate = string & { readonly [localDateBrand]: true }

export function parseLocalDate(value: Date | string): LocalDate {
    if (typeof value !== "string") {
        value = value.toISOString().slice(0, 10)
    }

    const date = new Date(`${value}T00:00:00Z`)

    if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
        throw new Error(`Invalid LocalDate: ${value}`);
    }

    return date.toISOString().slice(0, 10) as LocalDate;
}

export function toDate(localDate: LocalDate) {
    return new Date(localDate + "T00:00:00Z")
}