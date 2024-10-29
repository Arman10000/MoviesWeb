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

    const poster = document.createElement("img")
    poster.src = getPosterPath(contentDetails.posterPath)
    poster.alt = contentDetails.title

    const posterContainer = document.createElement("div")
    posterContainer.classList.add("infoContainer__posterContainer")
    posterContainer.append(poster)

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
            const play = document.createElement("img")
            play.classList.add("infoContainer__posterContainer__trailerContainer__playContainer__play")
            play.src = "icon/play.png"
            play.alt = "play"

            const playContainer = document.createElement("div")
            playContainer.classList.add("infoContainer__posterContainer__trailerContainer__playContainer")
            playContainer.append(play)

            const trailerText = document.createElement("span")
            trailerText.classList.add("infoContainer__posterContainer__trailerContainer__text")
            trailerText.innerText = "Смотреть трейлер"

            const trailerContainer = document.createElement("div")
            trailerContainer.classList.add("infoContainer__posterContainer__trailerContainer")
            trailerContainer.addEventListener("click", () => {
                showVideo(videoSrc)
            })
            trailerContainer.append(playContainer)
            trailerContainer.append(trailerText)

            posterContainer.append(trailerContainer)
        }
    }

    const ratingsTitle = document.createElement("h2")
    ratingsTitle.classList.add("infoContainer__detailsContainer__detailContainer__title")
    ratingsTitle.innerText = "Рейтинги:"

    const ratingsValue = document.createElement("span")
    ratingsValue.classList.add("infoContainer__detailsContainer__detailContainer__value")
    ratingsValue.innerText = `TMDb: ${contentDetails.ratingsIMDb.toFixed(1)}`

    const ratingsContainer = document.createElement("div")
    ratingsContainer.classList.add("infoContainer__detailsContainer__detailContainer")
    ratingsContainer.append(ratingsTitle)
    ratingsContainer.append(ratingsValue)

    const timeTitle = document.createElement("h2")
    timeTitle.classList.add("infoContainer__detailsContainer__detailContainer__title")
    timeTitle.innerText = "Время:"

    const timeValue = document.createElement("span")
    timeValue.classList.add("infoContainer__detailsContainer__detailContainer__value")
    timeValue.innerText = getTime(contentDetails.time)

    const timeContainer = document.createElement("div")
    timeContainer.classList.add("infoContainer__detailsContainer__detailContainer")
    timeContainer.append(timeTitle)
    timeContainer.append(timeValue)

    const releaseDateTitle = document.createElement("h2")
    releaseDateTitle.classList.add("infoContainer__detailsContainer__detailContainer__title")
    releaseDateTitle.innerText = "Дата выхода:"

    const releaseDateValue = document.createElement("span")
    releaseDateValue.classList.add("infoContainer__detailsContainer__detailContainer__value")
    releaseDateValue.innerText = getReleaseDate(contentDetails.releaseDate)

    const releaseDateContainer = document.createElement("div")
    releaseDateContainer.classList.add("infoContainer__detailsContainer__detailContainer")
    releaseDateContainer.append(releaseDateTitle)
    releaseDateContainer.append(releaseDateValue)

    const countryOriginTitle = document.createElement("h2")
    countryOriginTitle.classList.add("infoContainer__detailsContainer__detailContainer__title")
    countryOriginTitle.innerText = "Страна:"

    const countryOriginValue = document.createElement("span")
    countryOriginValue.classList.add("infoContainer__detailsContainer__detailContainer__value")
    countryOriginValue.innerText = getCountriesOrigin(contentDetails.countriesOrigin)

    const countryOriginContainer = document.createElement("div")
    countryOriginContainer.classList.add("infoContainer__detailsContainer__detailContainer")
    countryOriginContainer.append(countryOriginTitle)
    countryOriginContainer.append(countryOriginValue)

    const genreTitle = document.createElement("h2")
    genreTitle.classList.add("infoContainer__detailsContainer__detailContainer__title")
    genreTitle.innerText = "Жанр:"

    const genreValue = document.createElement("span")
    genreValue.classList.add("infoContainer__detailsContainer__detailContainer__value")
    genreValue.innerText = getGenres(contentDetails.genres)

    const genreContainer = document.createElement("div")
    genreContainer.classList.add("infoContainer__detailsContainer__detailContainer")
    genreContainer.append(genreTitle)
    genreContainer.append(genreValue)

    const descriptionValue = document.createElement("span")
    descriptionValue.innerText = contentDetails.description

    const descriptionContainer = document.createElement("div")
    descriptionContainer.classList.add("infoContainer__detailsContainer__detailContainer")
    descriptionContainer.append(descriptionValue)

    const posterTitle = document.createElement("h2")
    posterTitle.classList.add("infoContainer__detailsContainer__posterTitle")
    posterTitle.innerText = contentDetails.title

    const detailsContainer = document.createElement("div")
    detailsContainer.classList.add("infoContainer__detailsContainer")
    detailsContainer.append(posterTitle)
    detailsContainer.append(ratingsContainer)
    detailsContainer.append(timeContainer)
    detailsContainer.append(releaseDateContainer)
    detailsContainer.append(countryOriginContainer)
    detailsContainer.append(genreContainer)
    detailsContainer.append(descriptionContainer)

    const infoContainer = document.createElement("div")
    infoContainer.classList.add("infoContainer")
    infoContainer.append(posterContainer)
    infoContainer.append(detailsContainer)

    const main = document.querySelector("main")
    main.append(infoContainer)
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

