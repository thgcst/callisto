import { format, parse } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";

export default function convertDateToTimezone(date: Date | string) {
  const dt = new Date(date);
  const dtDateOnly = new Date(
    dt.valueOf() + dt.getTimezoneOffset() * 60 * 1000,
  );
  return dtDateOnly;
}

export const dayToDDMMYYYY = (day: Date | string, separator = "-") => {
  return format(convertDateToTimezone(day), `dd${separator}MM${separator}yyyy`);
};

export const dayToYYYYMMDD = (day: Date | string, separator = "-") => {
  return format(convertDateToTimezone(day), `yyyy${separator}MM${separator}dd`);
};

export const DDMMYYYYtoISO = (day: string, separator = "-") => {
  return parse(
    day,
    `dd${separator}MM${separator}yyyy`,
    new Date(),
  ).toISOString();
};

export const YYYYMMDDtoISO = (day: string, separator = "-") => {
  return parse(
    day,
    `yyyy${separator}MM${separator}dd`,
    new Date(),
  ).toISOString();
};

export const dayToLocaleString = (day: Date | string) => {
  return format(convertDateToTimezone(day), "d 'de' MMMM yyyy", {
    locale: ptBR,
  });
};
