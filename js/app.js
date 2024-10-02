const intToTime = (int) => {
  const days = Math.floor(int / 86400000); // 1000 * 60 * 60 * 24
  const daysRest = int - days * 86400000;
  const hours = Math.floor(daysRest / 3600000); // 1000 * 60 * 60
  const hoursRest = daysRest - hours * 3600000;
  const minutes = Math.floor(hoursRest / 60000); // 1000 * 60
  const minutesRest = hoursRest - minutes * 60000;
  const seconds = Math.floor(minutesRest / 1000);

  const parts = [];
  if (days > 0) {
    parts.push(`${days} días`);
    parts.push(`${hours} hora${hours === 1 ? "" : "s"}`);
  } else if (hours > 0) {
    parts.push(`${hours} hora${hours === 1 ? "" : "s"}`);
    parts.push(`${minutes} minuto${minutes === 1 ? "" : "s"}`);
  } else {
    if (minutes > 0) parts.push(`${minutes} minuto${minutes === 1 ? "" : "s"}`);
    parts.push(`${seconds} segundo${seconds === 1 ? "" : "s"}`);
  }

  return parts.join(" y ");
};

const countdown = () => {
  const highlighted = document.querySelector("section.highlighted");
  if (!highlighted) return;

  const dateTime = highlighted.querySelector("time").getAttribute("datetime");
  const parsedDate = Date.parse(dateTime);
  const countdownDiv = highlighted.querySelector("div.countdown");

  const updateCountdown = () => {
    const now = new Date().getTime();
    const diff = parsedDate - now;

    if (diff < 0) {
      countdownDiv.innerText = "AHORA!";
      return;
    }

    const content = `Faltan: ${intToTime(diff)}!`;
    countdownDiv.innerText = content;

    let wait = 60000; // update cada minuto por defecto
    if (content.includes("segundo")) {
      wait = 1000; // update cada segundo si mostramos segundos
    }

    setTimeout(updateCountdown, wait);
  };

  updateCountdown();
};

const bindMeetupDialogButton = () => {
  window.addEventListener("click", (e) => {
    const target = e.target;
    if (target.classList.contains("details")) {
      // previene scroll chando el modal está abierto
      const scroll = window.scrollY;
      document.body.style.top = `-${scroll}px`;
      document.body.style.position = "fixed";

      const dialog = target.nextElementSibling;
      dialog.querySelector(".closeDialog").addEventListener("click", () => {
        dialog.close();
      });

      dialog.addEventListener("close", () => {
        // ajusta el scroll cuando se cierra el modal
        document.body.style.position = "static";
        window.scrollTo(0, scroll);
        dialog.querySelectorAll("iframe").forEach((iframe) => iframe.remove());
      });

      dialog.querySelectorAll(".talk").forEach((talkDiv) => {
        let iframe = talkDiv.querySelector("iframe");
        if (iframe) return;

        const youtubeEmbedId = talkDiv.dataset.youtubeId;
        const youtubeEmbedTimestamp = talkDiv.dataset.youtubeTimestamp;
        if (youtubeEmbedId) {
          let youtubeEmbedURL = `https://www.youtube.com/embed/${youtubeEmbedId}`;
          if (youtubeEmbedTimestamp) {
            youtubeEmbedURL = `${youtubeEmbedURL}?start=${youtubeEmbedTimestamp}`;
          }

          const iframe = document.createElement("IFRAME");
          iframe.setAttribute("width", "560");
          iframe.setAttribute("title", "YouTube Video Player");
          iframe.setAttribute("src", youtubeEmbedURL);
          iframe.setAttribute("frameborder", "0");
          iframe.setAttribute(
            "allow",
            "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          );
          iframe.setAttribute(
            "referrerpolicy",
            "strict-origin-when-cross-origin"
          );
          iframe.setAttribute("allowfullscreen", true);

          talkDiv.insertAdjacentElement("beforeend", iframe);
        }
      });

      dialog.showModal();
    }
  });
};

const bindAboutUsImages = () => {
  const section = document.querySelector("#about_us");
  const picture = section.querySelector("picture");
  const sources = picture.querySelectorAll("source");
  const image = section.querySelector("img");
  const originalSrc = picture.dataset.originalSrc;
  const originalAlt = picture.dataset.originalAlt;

  // obtiene `jpg` o `webp` para saber qué imagenes hacer preload
  const extensionToUse = picture
    .querySelector("img")
    .currentSrc.replace(/.*\.(jpg|webp)/, "$1");

  const resetImage = () => {
    sources[0].srcset = `${originalSrc}.webp`;
    sources[1].srcset = `${originalSrc}.jpg`;
    image.src = `${originalSrc}.${extensionToUse}`;
    image.alt = originalAlt;
  };

  const members = [...section.querySelectorAll("button")];

  // preload después de un rato para que no flasheen al cambiar de imagen
  const altURLs = [
    picture.dataset.hoverSrc,
    ...members.map((button) => button.dataset.imageUrl),
  ];

  setTimeout(() => {
    altURLs.forEach((url) => {
      const preload = new Image();
      preload.src = `${url}.${extensionToUse}`;
    });
  }, 5000);

  // cambio main on hover
  picture.addEventListener("mouseenter", () => {
    sources[0].srcset = `${picture.dataset.hoverSrc}.webp`;
    sources[1].srcset = `${picture.dataset.hoverSrc}.jpg`;
    image.src = `${picture.dataset.hoverSrc}.${extensionToUse}`;
  });
  picture.addEventListener("mouseleave", resetImage);

  // cambio cada foto al hacer click en los nombres
  members.forEach((el) => {
    const setMember = () => {
      sources[0].srcset = `${el.dataset.imageUrl}.webp`;
      sources[1].srcset = `${el.dataset.imageUrl}.jpg`;
      image.src = `${el.dataset.imageUrl}.${extensionToUse}`;
      image.alt = el.dataset.imageAlt;
    };

    el.addEventListener("focus", setMember);
    el.addEventListener("blur", resetImage);

    // esto no tiene nada que ver con la imagen, pero bueno lo agrego acá porque es fácil
    // agrega un delay randon a la animación de los nombres para que no se muevan todos
    // los nombres igual
    el.style.setProperty(
      "--animation-delay",
      `${Math.floor(Math.random() * 10)}s`
    );
  });
};

const bindLogoFlip = () => {
  const logo = document.querySelector("[alt='Logo de Rubysur']");

  let logoFlipping = false;
  logo.addEventListener("mouseenter", () => {
    if (logoFlipping) return;

    logoFlipping = true;
    logo.style.setProperty("animation", "flip 500ms ease-in-out");
  });

  logo.addEventListener("animationend", () => {
    logoFlipping = false;
    logo.style.setProperty("animation", "");
  });
};

document.addEventListener("DOMContentLoaded", () => {
  countdown();
  bindMeetupDialogButton();
  bindAboutUsImages();
  bindLogoFlip();
});
