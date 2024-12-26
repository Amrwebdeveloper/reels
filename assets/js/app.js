let _click_ = 'touchend' in window ? 'dragstart' : 'click';
const reels = document.getElementById("reels");
let activeSlide, prevSlide, nextSlide;



function dataHandler(id) {
    return fetch('assets/db/dummy.json?' + Date.now(), { method: "POST" }).then(function (response) {
        return response.json();
    }).then(function (json) {
        let data = Object.values(json).filter(x => x["id"] === id)[0];
        return data;
    })
        .catch(err => { throw err });
}

function createReelElementByType(type, results, parent) {
    if (type == "video") {
        const reelEl = document.createElement("div");
        reelEl.setAttribute('class', 'reel');
        const overlay = document.createElement("div");
        overlay.setAttribute('class', 'overlay fc');
        reelEl.appendChild(overlay);

        const el = document.createElement("video");
        results.poster ? el.poster = results.poster : null;
        el.src = results.src;
        el.preload = results.preload || "auto";
        el.muted = results.autoplay || results.muted || false;
        el.autoplay = results.autoplay || false;
        el.controls = results.controls || false;
        el.loop = results.loop || true;
        el.setAttribute('webkit-playsinline', 'webkit-playsinline');
        reelEl.appendChild(el);
        parent.appendChild(reelEl);
        videoHandler(el);
    }


    if (type == "image") {
        const reelEl = document.createElement("div");
        reelEl.setAttribute('class', 'reel');
        const overlay = document.createElement("div");
        overlay.setAttribute('class', 'overlay');
        reelEl.appendChild(overlay);

        const el = document.createElement("img");
        el.src = results.src;
        reelEl.appendChild(el);
        parent.appendChild(reelEl);
    }
}

function videoHandler(vid) {
    switch (vid.src.split(/[#?]/)[0].split('.').pop().trim()) {
        case "m3u8":
            if (Hls.isSupported()) {
                var hls = new Hls();
                hls.loadSource(vid.src);
                hls.attachMedia(vid);
                hls.on(Hls.Events.MANIFEST_PARSED, function () {
                    vid.autoplay ? vid.play() : null;
                });
            } else if (vid.canPlayType('application/vnd.apple.mpegurl')) {
                vid.addEventListener('canplay', function () {
                    vid.autoplay ? vid.play() : null;
                });
            }
            break;
        case "mpd":
            let player = dashjs.MediaPlayer().create();
            player.initialize(vid, vid.src, true);
            break;
        default:
            vid.addEventListener('canplay', function () {
                vid.autoplay ? vid.play() : null;
            });
            break;
    }


    // overlay _click_ handler
    let overlay = vid.parentElement.querySelector(".overlay");
    overlay.addEventListener(_click_, () => {
        // if(overlay.classList.contains("fc")){}
        if (overlay.classList.contains("fc")) {
            overlay.classList.remove('fc');
            vid.muted = false;
            vid.volume = 1;
            vid.paused == true ? vid.play() : vid.pause();
        } else {
            vid.muted = false;
            vid.volume = 1;
            vid.paused == true ? vid.play() : vid.pause();
        }
    })


}

function activeSlideHandler(fristTime = true) {

    activeSlide = document.getElementsByClassName("swiper-slide-active")[0];

    dataHandler(activeSlide.getAttribute("data-video-active")).then(function (result) {
        let oldSlides = [];
        for (let i = 0; i < reel.slides.length; i++) {
            if (i === reel.realIndex) { continue; }
            oldSlides.push(i)
        }
        reel.removeSlide(oldSlides);

        fristTime ? createReelElementByType(result.type, result, activeSlide) : null;

        if (result.prev) {
            activeSlide.setAttribute("data-video-prev", result.prev);
            reel.prependSlide(`<div class="swiper-slide"data-video-active="${result.prev}"></div>`);
            prevSlide = document.getElementsByClassName("swiper-slide-prev")[0];

            dataHandler(result.prev).then(function (result) {
                createReelElementByType(result.type, result, prevSlide);
            });

        }

        if (result.next) {
            activeSlide.setAttribute("data-video-next", result.next);
            reel.appendSlide(`<div class="swiper-slide" data-video-active="${result.next}"></div>`);
            nextSlide = document.getElementsByClassName("swiper-slide-next")[0];

            dataHandler(result.next).then(function (result) {
                createReelElementByType(result.type, result, nextSlide);
            });

        }

    });
}


let reel = new Swiper("#reels", {
    init: false,
    direction: "vertical",
    centeredSlides: true,
    mousewheel: true,
    keyboard: {
        enabled: true,
    },
});

reel.on('init', function () {
    activeSlideHandler();
});

reel.init();
console.log(activeSlide.getAttribute("data-video-prev"));
console.log(activeSlide.getAttribute("data-video-active") + " ---(now)");
console.log(activeSlide.getAttribute("data-video-next"));



reel.on('slideChangeTransitionStart', function () {
    prevSlide = document.getElementsByClassName("swiper-slide-prev")[0];
    activeSlide = document.getElementsByClassName("swiper-slide-active")[0];
    nextSlide = document.getElementsByClassName("swiper-slide-next")[0];
    console.clear();

    if (prevSlide) {
        if (prevSlide.querySelectorAll("video").length > 0) {
            prevSlide.querySelectorAll("video").forEach(video => {
                video.currentTime = 0;
                video.pause();
            });
        }
    }
    if (activeSlide) {
        if (activeSlide.querySelectorAll("video").length > 0) {
            activeSlide.querySelectorAll("video").forEach(video => {
                video.currentTime = 0;
                video.play();
            });
        }
    }
    if (nextSlide) {
        if (nextSlide.querySelectorAll("video").length > 0) {
            nextSlide.querySelectorAll("video").forEach(video => {
                video.currentTime = 0;
                video.pause();
            });
        }
    }

    activeSlideHandler(false);

    console.log(activeSlide.getAttribute("data-video-prev"));
    console.log(activeSlide.getAttribute("data-video-active") + " ---(now)");
    console.log(activeSlide.getAttribute("data-video-next"));


});

