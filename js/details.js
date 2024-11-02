import {
    addElementsToHead,
    addElementsToHeader,
    startProgress,
    stopProgress,
    getPosterPath,
    BAS_URL, RU,
    MOVIE, SERIAL, OPTIONS,
    Movie, Serial
} from "./core.js";

const VIDEOS = "videos"
const BAS_VIDEO_URL = "https://www.youtube.com/watch"

addElementsToHead()
addElementsToHeader()

await downloadDetails()

async function downloadDetails() {
    startProgress()
    const urlSearchParams = new URLSearchParams(window.location.search)
    const contentType = urlSearchParams.get("contentType")
    const contentId = urlSearchParams.get("contentId")

    let contentUrl
    if (contentType === MOVIE) {
        contentUrl = `${BAS_URL}/${MOVIE}/${contentId}?language=${RU}`
    } else {
        contentUrl = `${BAS_URL}/${SERIAL}/${contentId}?language=${RU}`
    }
    const json = await getContent(contentUrl)
    console.log(json)

    let contentDetails
    if (contentType === MOVIE) {
        contentDetails = new Movie(json)
    } else {
        contentDetails = new Serial(json)
    }

    const headTitle = document.getElementById("headTitle")
    headTitle.innerText = contentDetails.title

    const poster = document.getElementById("poster")
    poster.src = getPosterPath(contentDetails.posterPath)
    poster.alt = contentDetails.title

    let videosUrl = getVideosUrl(contentId, contentType, RU)
    let videos = await getVideos(videosUrl)
    let isVideos = true

    if (videos === null || videos.length === 0) {
        if (contentDetails.originalLanguage === "" || contentDetails.originalLanguage === RU) {
            isVideos = false
        } else {
            videosUrl = getVideosUrl(contentId, contentType, contentDetails.originalLanguage)
            videos = await getVideos(videosUrl)

            if (videos === null || videos.length === 0) {
                isVideos = false
            }
        }
    }

    if (isVideos) {
        const videoSrc = getVideoSrc(videos)
        if (videoSrc !== null) {
            const trailerContainer = document.getElementById("trailerContainer")
            trailerContainer.classList.add("infoContainer__posterContainer__trailerContainerShow")
            trailerContainer.addEventListener("click", () => {
                showVideo(videoSrc)
            })

            const trailerContainerText = document.getElementById("trailerContainerText")
            const resizeObserver = new ResizeObserver(entries => {
                for (let entry of entries) {
                    const width = entry.contentRect.width;
                    let fontSize = width * 0.065
                    if (fontSize < 14) {
                        fontSize = 14
                    }
                    trailerContainerText.style.fontSize = `${fontSize}px`;
                }
            });
            resizeObserver.observe(trailerContainer);
        }
    }

    const posterTitle = document.getElementById("posterTitle")
    posterTitle.innerText = contentDetails.title

    const rating = document.getElementById("rating")
    rating.innerText = `TMDb: ${contentDetails.ratingsIMDb.toFixed(1)}`

    const time = document.getElementById("time")
    time.innerText = getTime(contentDetails.time)

    const releaseDate = document.getElementById("releaseDate")
    releaseDate.innerText = getReleaseDate(contentDetails.releaseDate)

    const countriesOrigin = document.getElementById("countriesOrigin")
    countriesOrigin.innerText = getCountriesOrigin(contentDetails.countriesOrigin)

    const genres = document.getElementById("genres")
    genres.innerText = getGenres(contentDetails.genres)

    const description = document.getElementById("description")
    description.innerText = contentDetails.description

    const infoContainer = document.getElementById("infoContainer")
    infoContainer.classList.add("infoContainerShow")

    stopProgress()
}

async function getContent(url) {
    const response = await fetch(url, OPTIONS)
    if (!response.ok) {
        throw new Error("Ошибка сети: " + response.status)
    } else {
        return await response.json()
    }
}

async function showVideo(video) {
    //noinspection JSUnresolvedVariable
    Fancybox.show([{
        youtube: {
            autoplay: 0
        },
        src: video
    }])
}

async function getVideos(url) {
    const response = await fetch(url, OPTIONS)
    if (!response.ok) {
        throw new Error("Ошибка сети: " + response.status)
    } else {
        const json = await response.json()
        console.log(json)
        //noinspection JSUnresolvedVariable
        return json.results
    }
}

function getVideoSrc(videos) {
    for (const video of videos) {
        if (video.type === "Trailer") {
            const videoId = video.key
            return `${BAS_VIDEO_URL}?v=${videoId}`
        }
    }
    return null
}

function getVideosUrl(contentId, contentType, language) {
    if (contentType === MOVIE) {
        return `${BAS_URL}/${MOVIE}/${contentId}/${VIDEOS}?language=${language}`
    } else {
        return `${BAS_URL}/${SERIAL}/${contentId}/${VIDEOS}?language=${language}`
    }
}

function getTime(minutesP) {
    if (minutesP === null) return ""
    const hours = Math.floor(minutesP / 60)
    const minutes = minutesP % 60
    if (hours === 0) {
        return `${minutes}м`
    }
    if (minutes === 0) {
        return `${hours}ч`
    }
    return `${hours}ч ${minutes}м`
}

function getReleaseDate(releaseDate) {
    if (releaseDate === null) return ""
    const date = new Date(releaseDate)
    const months = [
        "января", "февраля", "марта", "апреля", "мая", "июня",
        "июля", "августа", "сентября", "октября", "ноября", "декабря"
    ]
    const day = date.getDate()
    const month = months[date.getMonth()]
    const year = date.getFullYear()

    return `${day} ${month} ${year}`
}

function getCountriesOrigin(countriesOrigin) {
    if (countriesOrigin === null) return ""
    let countriesOriginString = ""
    for (let i = 0; i < countriesOrigin.length; i++) {
        if (i + 1 === countriesOrigin.length) {
            countriesOriginString = countriesOriginString + `${countriesOrigin[i]}`
        } else {
            countriesOriginString = countriesOriginString + `${countriesOrigin[i]}, `
        }
    }
    return countriesOriginString
}

function getGenres(genres) {
    if (genres === null) return ""
    let genresString = ""
    for (let i = 0; i < genres.length; i++) {
        if (i + 1 === genres.length) {
            genresString = genresString + `${genres[i].name}`
        } else {
            genresString = genresString + `${genres[i].name}, `
        }
    }
    return genresString
}

