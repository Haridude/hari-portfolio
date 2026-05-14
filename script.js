const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const navItems = document.querySelectorAll(".nav-links a");
const isCoarsePointer = window.matchMedia("(hover: none), (pointer: coarse)").matches;
const isSmallViewport = window.matchMedia("(max-width: 720px)").matches;

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

navItems.forEach((item) => {
  item.addEventListener("click", () => {
    if (navLinks && navLinks.classList.contains("open")) {
      navLinks.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });
});

const intro = document.getElementById("intro");
const introBarFill = document.getElementById("introBarFill");

if (!intro) {
  document.body.classList.remove("is-loading");
} else {
  let isIntroClosed = false;
  const introDuration = 1150;
  const introStart = performance.now();

  const closeIntro = () => {
    if (isIntroClosed) {
      return;
    }

    isIntroClosed = true;
    intro.classList.add("intro-exit");
    setTimeout(() => {
      document.body.classList.remove("is-loading");
    }, 300);

    setTimeout(() => {
      intro.remove();
    }, 680);
  };

  const animateIntroBar = (timestamp) => {
    if (isIntroClosed) {
      return;
    }

    const elapsed = timestamp - introStart;
    const progress = Math.max(0, Math.min(1, elapsed / introDuration));

    if (introBarFill) {
      introBarFill.style.transform = `scaleX(${progress})`;
    }

    if (progress < 1) {
      requestAnimationFrame(animateIntroBar);
    } else {
      closeIntro();
    }
  };

  requestAnimationFrame(animateIntroBar);

  setTimeout(closeIntro, 2200);
}

const sparklesRoot = document.getElementById("sparkles");

if (sparklesRoot) {
  const sparkleColors = [
    "rgba(22, 219, 201, 0.95)",
    "rgba(14, 165, 233, 0.95)",
    "rgba(255, 79, 216, 0.95)",
    "rgba(255, 147, 70, 0.95)",
    "rgba(125, 107, 255, 0.95)"
  ];

  const sparkleCount = isSmallViewport ? 0 : 12;

  for (let i = 0; i < sparkleCount; i += 1) {
    const dot = document.createElement("span");
    dot.className = "sparkle-dot";

    dot.style.left = `${Math.random() * 100}%`;
    dot.style.top = `${Math.random() * 100}%`;
    dot.style.setProperty("--spark-color", sparkleColors[Math.floor(Math.random() * sparkleColors.length)]);
    dot.style.setProperty("--spark-dur", `${3.8 + Math.random() * 4.2}s`);
    dot.style.setProperty("--spark-delay", `${Math.random() * 6}s`);

    sparklesRoot.append(dot);
  }
}

const setPointer = (x, y) => {
  document.documentElement.style.setProperty("--pointer-x", `${x}px`);
  document.documentElement.style.setProperty("--pointer-y", `${y}px`);
};

let queuedPointerUpdate = false;
let queuedPointerX = 0;
let queuedPointerY = 0;

const queuePointerUpdate = (x, y) => {
  queuedPointerX = x;
  queuedPointerY = y;

  if (queuedPointerUpdate) {
    return;
  }

  queuedPointerUpdate = true;
  requestAnimationFrame(() => {
    setPointer(queuedPointerX, queuedPointerY);
    queuedPointerUpdate = false;
  });
};

if (!isCoarsePointer) {
  window.addEventListener("mousemove", (event) => {
    queuePointerUpdate(event.clientX, event.clientY);
  });

  window.addEventListener(
    "touchmove",
    (event) => {
      const touch = event.touches[0];
      if (touch) {
        queuePointerUpdate(touch.clientX, touch.clientY);
      }
    },
    { passive: true }
  );
} else {
  setPointer(window.innerWidth * 0.5, window.innerHeight * 0.35);
}

const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -60px 0px" }
  );

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("visible"));
}

const projectCards = document.querySelectorAll(".project-card");

if (!isCoarsePointer) {
  projectCards.forEach((card) => {
    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      const rotateY = x * 8;
      const rotateX = -y * 7;
      card.style.setProperty("--rx", `${rotateX.toFixed(2)}deg`);
      card.style.setProperty("--ry", `${rotateY.toFixed(2)}deg`);
    });

    card.addEventListener("mouseleave", () => {
      card.style.setProperty("--rx", "0deg");
      card.style.setProperty("--ry", "0deg");
    });
  });
}

const projectVideos = document.querySelectorAll(".project-video");

const safeVideoPlay = (video) => {
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  if (video.readyState === 0) {
    video.load();
  }
  const playPromise = video.play();
  if (playPromise && typeof playPromise.catch === "function") {
    return playPromise.catch(() => false);
  }
  return Promise.resolve(true);
};

projectVideos.forEach((video) => {
  const thumb = video.closest(".project-thumb");
  const tapButton = thumb?.querySelector(".video-tap");
  video.muted = true;
  video.defaultMuted = true;
  video.loop = true;
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");

  let readyFallbackTimer;

  const applyVideoRatio = () => {
    if (thumb && video.videoWidth > 0 && video.videoHeight > 0) {
      const ratio = video.videoWidth / video.videoHeight;
      if (isCoarsePointer && ratio < 1) {
        thumb.style.aspectRatio = `${video.videoWidth} / ${video.videoHeight}`;
      } else if (!isCoarsePointer) {
        thumb.style.aspectRatio = `${video.videoWidth} / ${video.videoHeight}`;
      }
    }
  };

  const markReady = () => {
    if (readyFallbackTimer) {
      clearTimeout(readyFallbackTimer);
      readyFallbackTimer = undefined;
    }
    video.classList.add("is-ready");
  };

  const showError = () => {
    markReady();
    if (thumb) {
      thumb.classList.add("error");
    }
    if (tapButton) {
      tapButton.textContent = "Tap to play";
    }
  };

  video.addEventListener("loadeddata", markReady);
  video.addEventListener("canplay", markReady);
  video.addEventListener("loadedmetadata", markReady);
  video.addEventListener("stalled", markReady);
  video.addEventListener("error", showError);
  video.addEventListener("play", () => {
    if (thumb) {
      thumb.classList.add("playing");
      thumb.classList.remove("error");
    }
  });
  video.addEventListener("pause", () => {
    if (thumb) {
      thumb.classList.remove("playing");
    }
  });

  const tapPlay = () => {
    safeVideoPlay(video);
  };

  if (tapButton) {
    tapButton.addEventListener("click", (event) => {
      event.stopPropagation();
      tapPlay();
    });
  }

  if (thumb && isCoarsePointer) {
    thumb.addEventListener("click", tapPlay);
  }

  if (video.readyState >= 1) {
    applyVideoRatio();
    markReady();
  } else {
    video.addEventListener("loadedmetadata", applyVideoRatio);
  }

  readyFallbackTimer = window.setTimeout(markReady, 1400);
});

if ("IntersectionObserver" in window) {
  const threshold = isCoarsePointer ? 0.2 : 0.45;
  const videoObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        if (!(video instanceof HTMLVideoElement)) {
          return;
        }

        if (entry.isIntersecting) {
          safeVideoPlay(video);
        } else {
          video.pause();
        }
      });
    },
    { threshold, rootMargin: isCoarsePointer ? "180px 0px" : "80px 0px" }
  );

  projectVideos.forEach((video) => videoObserver.observe(video));
}

if (isCoarsePointer) {
  const unlockVideos = () => {
    projectVideos.forEach((video) => {
      const rect = video.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (inView) {
        safeVideoPlay(video);
      }
    });
  };
  window.addEventListener("pointerdown", unlockVideos, { passive: true, once: true });
  window.addEventListener("touchstart", unlockVideos, { passive: true, once: true });
}

const year = document.getElementById("year");
if (year) {
  year.textContent = String(new Date().getFullYear());
}
