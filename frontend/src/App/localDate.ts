const localDateBrand: unique symbol = Symbol("LocalDate")

export type LocalDate = string & { readonly [localDateBrand]: true }

export function parseLocalDate(value: Date | string = new Date(Date.now())): LocalDate {
    if (value instanceof Date) {
        value = value.toISOString().slice(0, 10);
    }

    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

    if (!match) {
        throw new Error(`Invalid LocalDate: ${value}`);
    }

    const [, year, month, day] = match;

    const date = new Date(Date.UTC(
        Number(year),
        Number(month) - 1,
        Number(day)
    ));

    if (
        date.getUTCFullYear() !== Number(year) ||
        date.getUTCMonth() !== Number(month) - 1 ||
        date.getUTCDate() !== Number(day)
    ) {
        throw new Error(`Invalid LocalDate: ${value}`);
    }

    return value as LocalDate;
}

export function toDate(localDate: LocalDate) {
    return new Date(localDate + "T00:00:00")
}