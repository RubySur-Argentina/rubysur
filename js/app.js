const intToTime = (int) => {
  const days = Math.floor(int / 86400000); // 1000 * 60 * 60 * 24
  const daysRest = int - days * 86400000;
  const hours = Math.floor(daysRest / 3600000); // 1000 * 60 * 60
  const hoursRest = daysRest - hours * 3600000;
  const minutes = Math.floor(hoursRest / 60000); // 1000 * 60
  const minutesRest = hoursRest - minutes;
  const seconds = Math.floor(minutesRest / 1000);

  const parts = [];
  if (days > 0) parts.push(`${days} días`);
  parts.push(`${hours} hora${hours === 1 ? "" : "s"}`);
  parts.push(`${minutes} minuto${minutes === 1 ? "" : "s"}`);
  if (days === 0) parts.push(`${seconds} segundo${seconds === 1 ? "" : "s"}`);

  return parts.join(", ");
};

const countdown = () => {
  const highlighted = document.querySelector("section.highlighted");
  const dateTime = highlighted.querySelector("time").getAttribute("datetime");
  const parsedDate = Date.parse(dateTime);
  const countdownDiv = highlighted.querySelector("div.countdown");

  const updateCountdown = () => {
    const now = new Date().getTime();
    const content = `Faltan ${intToTime(parsedDate - now)}`;
    countdownDiv.innerText = content;

    const wait = 60000; // update cada minuto por defecto
    if (content.includes("segundos")) {
      wait = 1000; // update cada segundo si mostramos segundos
    }

    setTimeout(updateCountdown, wait);
  };

  updateCountdown();
};

document.addEventListener("DOMContentLoaded", () => {
  countdown();
});
