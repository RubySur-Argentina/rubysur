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
    if (hours > 0) parts.push(`${hours} hora${hours === 1 ? "" : "s"}`);
  } else if (hours > 0) {
    parts.push(`${hours} hora${hours === 1 ? "" : "s"}`);
    if (minutes > 0) parts.push(`${minutes} minuto${minutes === 1 ? "" : "s"}`);
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
    const minuto = 60000;

    if (diff < 15 * minuto) { // 15 minutos antes del evento
      highlighted.querySelector(".streaming").classList.remove('hide')
      highlighted.querySelector(".detalles").classList.add('hide')
    }

    if (diff < -180 * minuto) { // 3hs después de que empezó el evento
      countdownDiv.innerText = "Mirá nuestro último evento";
      return;
    }

    if (diff < 0) {
      countdownDiv.innerText = "AHORA!";
      return;
    }

    const content = `Faltan: ${intToTime(diff)}!`;
    countdownDiv.innerText = content;

    let wait = minuto; // update cada minuto por defecto
    if (content.includes("segundo")) {
      wait = 1000; // update cada segundo si mostramos segundos
    }

    setTimeout(updateCountdown, wait);
  };

  updateCountdown();
};

const openDialog = ({ dialog, onClose }) => {
  // previene scroll chando el modal está abierto
  const scroll = window.scrollY;
  document.body.style.top = `-${scroll}px`;
  document.body.style.position = "fixed";

  dialog.addEventListener(
    "close",
    () => {
      // ajusta el scroll cuando se cierra el modal
      document.body.style.position = "static";
      window.scrollTo(0, scroll);
      onClose();
    },
    { once: true }
  );

  dialog.showModal();
};

const bindCloseDialogButtons = () => {
  window.addEventListener("click", (e) => {
    const closeButton = e.target.closest(".closeDialog");
    if (!closeButton) return;

    const dialog = closeButton.closest("dialog");
    dialog?.close();
  });
};

const bindMeetupDialogButton = () => {
  window.addEventListener("click", (e) => {
    const target = e.target;
    if (target.classList.contains("details")) {
      const dialog = target.parentElement.querySelector(".meetupDetails");

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

      openDialog({
        dialog,
        onClose: () => {
          dialog
            .querySelectorAll("iframe")
            .forEach((iframe) => iframe.remove());
        },
      });
    }
  });
};

const galleryPreviousArrows = ["ArrowUp", "ArrowLeft"];
const galleryNextArrows = ["ArrowDown", "ArrowRight"];

const bindMeetupGalleryButton = () => {
  window.addEventListener("click", (e) => {
    const target = e.target;
    if (!target.classList.contains("gallery")) return;

    const dialog = target.parentElement.querySelector(".meetupGallery");
    const mainElement = dialog.querySelector(".mainElement");
    const thumbnails = dialog.querySelector(".thumbnails");
    let currentElement = null;

    const onKeyDown = (e) => {
      if (!e.code.startsWith("Arrow")) return;

      // sin scroll de las flechas
      e.stopPropagation();
      e.preventDefault();

      // si por algún movito no hay currentElement, se muestra el primero
      if (!currentElement) {
        thumbnails.querySelector("button").click();
        return;
      }

      switch (e.code) {
        case "ArrowUp":
        case "ArrowLeft":
          currentElement.previousElementSibling?.click();
          break;
        case "ArrowDown":
        case "ArrowRight":
          currentElement.nextElementSibling?.click();
          break;
      }
    };
    dialog.addEventListener("keydown", onKeyDown);

    const onThumbnailClick = (e) => {
      const btn = e.target;
      if (!btn.dataset.filename) return;

      // foco y scroll
      currentElement = btn;
      currentElement.focus();
      currentElement.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "center",
      });

      const alt = btn.querySelector("img").alt;

      // actualizo vista con la nueva imagen/video
      if (btn.dataset.mediaType === "image") {
        const path = `/media/meetups/${dialog.dataset.meetupKey}/`;
        const picture = `<picture>
          <source media="(max-width: 250px)" srcset="${path}${btn.dataset.filename}_thumbnail.jpg">
          <source media="(max-width: 500px)" srcset="${path}${btn.dataset.filename}-480.webp">
          <source media="(max-width: 500px)" srcset="${path}${btn.dataset.filename}-480.jpg">
          <source media="(max-width: 800px)" srcset="${path}${btn.dataset.filename}-768.webp">
          <source media="(max-width: 800px)" srcset="${path}${btn.dataset.filename}-768.jpg">
          <source media="(max-width: 1400px)" srcset="${path}${btn.dataset.filename}-1280.webp">
          <source media="(max-width: 1400px)" srcset="${path}${btn.dataset.filename}-1280.jpg">

          <img src="${path}${btn.dataset.filename}-1280.webp" alt="${alt}">
        </picture>`;

        mainElement.innerHTML = picture;
      }

      if (btn.dataset.mediaType === "video") {
        const video = `<video controls>
          <source src="/media/meetups/${dialog.dataset.meetupKey}/${btn.dataset.filename}.mp4" type="video/mp4" alt="${alt}" />
        </video>`;

        mainElement.innerHTML = video;
      }
    };
    thumbnails.addEventListener("click", onThumbnailClick);

    // muestro la primera imagen/video al abrir el dialog
    thumbnails.querySelector("button").click();

    // abro dialog
    openDialog({
      dialog,
      onClose: () => {
        dialog.querySelector(".mainElement").innerHTML = "";
        dialog.removeEventListener("keydown", onKeyDown);
        thumbnails.removeEventListener("click", onThumbnailClick);
      },
    });
  });
};

const bindAboutUsImages = () => {
  const section = document.querySelector("#about_us");
  if (!section) return;

  const pictureWrapper = section.querySelector(".pictureWrapper");
  const picture = pictureWrapper.querySelector("picture");
  const image = picture.querySelector("img");
  const originalAlt = picture.dataset.originalAlt;

  const resetImage = () => {
    pictureWrapper.classList = "pictureWrapper textBox";
    image.alt = originalAlt;
  };

  const members = [...section.querySelectorAll("button")];

  // cambio main on hover
  pictureWrapper.addEventListener("mouseenter", () => {
    pictureWrapper.classList = "pictureWrapper textBox alt";
  });
  pictureWrapper.addEventListener("click", () => {
    pictureWrapper.classList = "pictureWrapper textBox alt";
  });
  pictureWrapper.addEventListener("mouseleave", resetImage);

  // cambio cada foto al hacer click en los nombres
  members.forEach((el) => {
    const setMember = () => {
      if (el.dataset.pictureClass === "ariel") {
        const gifImage = document.querySelector(".easterEgg.ariel");
        const src = gifImage.src;
        gifImage.src = "";
        gifImage.src = src;
      }

      pictureWrapper.classList.add(el.dataset.pictureClass);
      image.alt = el.dataset.imageAlt;
    };

    el.addEventListener("click", () => el.focus());
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
  const logo = document.querySelector("[alt='Logo de RubySur']");
  if (!logo) return;

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

const altTitles = [
  "Hey! volvé!!",
  "Este es el tab que estás buscando",
  "Acá están las meetups",
  "Helado gratis",
  "ɿuƧyduЯ",
  "👀👀👀👀👀👀👀",
  "La pagina más importante",
  "esto no es una página",
  "Y TUUUUU TE VAAAAS ASI COMO SI NADAA (y tu te vaaaas)",
  "VUELVE! que sin ti la vida se me vaaaa!",
  "💎🇦🇷",
  "No te vayas chavo...",
  "💩",
];

const bindTabTitle = () => {
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      document.title = `RubySur - ${
        altTitles[Math.floor(Math.random() * altTitles.length)]
      }`;
    } else {
      document.title = "RubySur - Argentina";
    }
  });
};

const bindStatsNumbers = () => {
  const statsSpans = document.querySelectorAll("section.stats span");
  statsSpans.forEach((span) => {
    const num = parseInt(span.innerText);
    span.dataset.originalNum = num;
    span.innerText = 0;
  });

  const threshold = 0.1;
  const options = {
    rootMargin: "0px",
    threshold,
  };

  const duration = 2000;
  const stepDuration = 50;
  let timer = null;

  const observer = new IntersectionObserver((entries, observer) => {
    if (entries[0].intersectionRatio < threshold) {
      // no se ve, reset a 0
      if (timer) clearInterval(timer);
      statsSpans.forEach((span) => (span.innerText = 0));
    } else {
      let steps = 0;
      timer = setInterval(() => {
        const total = steps * stepDuration;

        if (total > duration) {
          statsSpans.forEach((span) => {
            span.innerText = span.dataset.originalNum;
            if (timer) clearInterval(timer);
          });
        } else {
          statsSpans.forEach((span) => {
            span.innerText = Math.round(
              (span.dataset.originalNum * total) / duration
            );
          });
        }
        steps += 1;
      }, stepDuration);
    }
  }, options);

  observer.observe(document.querySelector("section.stats"));
};

document.addEventListener("DOMContentLoaded", () => {
  countdown();
  bindCloseDialogButtons();
  bindMeetupDialogButton();
  bindMeetupGalleryButton();
  bindAboutUsImages();
  bindLogoFlip();
  bindTabTitle();
  bindStatsNumbers();
  snake();
});
