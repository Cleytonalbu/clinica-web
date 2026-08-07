export function formatDateInput(
  date: Date
) {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      date.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function parseDateInput(
  value: string
) {
  const [
    year,
    month,
    day,
  ] = value
    .split("-")
    .map(Number);

  return new Date(
    year,
    month - 1,
    day
  );
}

export function addDays(
  value: string,
  amount: number
) {
  const date =
    parseDateInput(value);

  date.setDate(
    date.getDate() +
      amount
  );

  return formatDateInput(
    date
  );
}

export function getWeekDays(
  value: string
) {
  const selected =
    parseDateInput(value);

  const currentDay =
    selected.getDay();

  const mondayOffset =
    currentDay === 0
      ? -6
      : 1 - currentDay;

  const monday =
    new Date(selected);

  monday.setDate(
    selected.getDate() +
      mondayOffset
  );

  return Array.from(
    { length: 7 },
    (_, index) => {
      const date =
        new Date(monday);

      date.setDate(
        monday.getDate() +
          index
      );

      return {
        date:
          formatDateInput(
            date
          ),

        label:
          new Intl.DateTimeFormat(
            "pt-BR",
            {
              weekday: "short",
              day: "2-digit",
            }
          ).format(date),
      };
    }
  );
}

export function formatLongDate(
  value: string
) {
  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  ).format(
    parseDateInput(
      value
    )
  );
}

export function getMonthData(
  value: string
) {
  const selected =
    parseDateInput(value);

  const year =
    selected.getFullYear();

  const month =
    selected.getMonth();

  const firstDay =
    new Date(
      year,
      month,
      1
    );

  const lastDay =
    new Date(
      year,
      month + 1,
      0
    );

  const title =
    new Intl.DateTimeFormat(
      "pt-BR",
      {
        month: "long",
        year: "numeric",
      }
    ).format(firstDay);

  return {
    year,
    month,
    daysInMonth:
      lastDay.getDate(),
    firstWeekDay:
      firstDay.getDay(),
    title,
  };
}