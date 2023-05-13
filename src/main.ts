import { z } from "zod";

const searchInput = document.querySelector<HTMLInputElement>("#search-input")!;
const weatherForm = document.querySelector<HTMLFormElement>("#weather-form")!;
const country = document.querySelector<HTMLSpanElement>("#country")!;
const city = document.querySelector<HTMLSpanElement>("#city")!;
const temperature = document.querySelector<HTMLSpanElement>("#temperature")!;

const geocode = async (city: string) => {
  const resultsSchema = z.object({
    results: z.array(
      z.object({
        id: z.number(),
        name: z.string(),
        latitude: z.number(),
        longitude: z.number(),
        country: z.string(),
        timezone: z.string(),
      })
    ),
  });
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=10&language=en&format=json`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Something went wrong.");
  }

  const json = await response.json();

  const parsed = resultsSchema.safeParse(json);

  if (!parsed.success) {
    throw new Error("We could not find that city.");
  }

  return parsed.data.results[0];
};

const fetchWeather = async (latitude: number, longitude: number) => {
  const resultSchema = z.object({
    latitude: z.number(),
    longitude: z.number(),
    hourly: z.object({
      time: z.array(z.string()),
      temperature_2m: z.array(z.number()),
    }),
  });

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Something went- wrong.");
  }

  const json = await response.json();
  const parsed = resultSchema.safeParse(json);

  if (!parsed.success) {
    throw new Error("Something went wrong.");
  }

  return parsed.data;
};

weatherForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const city = searchInput.value;
  geocode(city)
    .then((data) => {
      return fetchWeather(data.latitude, data.longitude);
    })
    .then((data) => {
      console.log(data);
      temperature.textContent = data.hourly.temperature_2m[0].toString();
    })
    .catch((error) => {
      console.log(error);
    });
});
