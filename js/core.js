const TOKEN = "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI4NGYwZjNhN2JkMDg3NjliOTUwMTZmYzI1YTgwYTNlZiIsIm5iZiI6MTcyODYyOTA5MS4wMDc3MTYsInN1YiI6IjYyMzcwMzA2ZGI0ZWQ2MDA0NTE2MGE4YSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.lGxTnIHNlNjUBffQUx17UaWOdpo3qj2coin_IqUU2P4"
export const BAS_URL = "https://api.themoviedb.org/3"
const BAS_IMAGE_URL = "https://image.tmdb.org/t/p"
const IMAGE_SIZE = "/w300_and_h450_face"
export const RU = "ru"
const POPULARITY = "popularity.desc"
export const MOVIE = "movie"
export const SERIAL = "tv"
const numberEmptyCards = 3
let page = 0
let isLoading = true
export const OPTIONS = {
    method: "GET",
    headers: {accept: "application/json", Authorization: TOKEN}
}
const cardContainer = document.getElementById("cardContainer")
let isMovies
let isSerials

export async function init(
    isMoviesP,
    isSerialsP
) {
    isMovies = isMoviesP
    isSerials = isSerialsP
    addElementsToHead()
    addElementsToHeader()
    await downloadContent()
}

export function addElementsToHead() {
    const viewportMeta = document.createElement("meta")
    viewportMeta.name = "viewport"
    viewportMeta.content = "width=device-width, initial-scale=1.0"

    const shortcutIcon = document.createElement("link")
    shortcutIcon.rel = "shortcut icon"
    shortcutIcon.type = "image/x-icon"
    shortcutIcon.href = "icon/shortcut.ico"

    const head = document.querySelector("head")
    head.append(viewportMeta)
    head.append(shortcutIcon)
}

export function addElementsToHeader() {
    const logoRef = document.createElement("a")
    logoRef.classList.add("logo")
    logoRef.title = "На главную"
    logoRef.href = "main.html"

    const moviesRef = document.createElement("a")
    moviesRef.href = "movies.html"
    moviesRef.innerText = "Фильмы"

    const serialsRef = document.createElement("a")
    serialsRef.href = "serials.html"
    serialsRef.innerText = "Сериалы"

    addMenuListener([moviesRef, serialsRef])

    const moviesItem = document.createElement("li")
    moviesItem.classList.add("menu__item")
    moviesItem.append(moviesRef)

    const serialsItem = document.createElement("li")
    serialsItem.classList.add("menu__item")
    serialsItem.append(serialsRef)

    const menu = document.createElement("ul")
    menu.classList.add("menu")
    menu.append(moviesItem)
    menu.append(serialsItem)

    const nav = document.createElement("nav")
    nav.append(menu)

    const header = document.querySelector("header")
    header.append(logoRef)
    header.append(nav)
}

async function downloadContent() {
    startProgress()
    page++

    let movies = []
    let serials = []
    if (isMovies) {
        const moviesUrl = `${BAS_URL}/discover/${MOVIE}?&language=${RU}&page=${page}&sort_by=${POPULARITY}`
        movies = await getContent(moviesUrl)
    }
    if (isSerials) {
        const serialsUrl = `${BAS_URL}/discover/${SERIAL}?&language=${RU}&page=${page}&sort_by=${POPULARITY}`
        serials = await getContent(serialsUrl)
    }

    console.log(movies)
    console.log(serials)

    let moviesCount = movies.length
    let movieIndex = 0
    let serialsCount = serials.length
    let serialIndex = 0
    while (true) {
        if (moviesCount === 0 && serialsCount === 0) break
        if (moviesCount > 0) {
            const movie = movies[movieIndex]
            addCards(movie, MOVIE)
            movieIndex++
            moviesCount--
        }
        if (serialsCount > 0) {
            const serial = serials[serialIndex]
            addCards(serial, SERIAL)
            serialIndex++
            serialsCount--
        }
    }

    if (page === 1) {
        addEmptyCards()
        await createButton()
    }

    stopProgress()
    isLoading = false
}

async function getContent(url) {
    const response = await fetch(url, OPTIONS)
    if (!response.ok) {
        throw new Error("Ошибка сети: " + response.status)
    } else {
        const json = await response.json()
        //noinspection JSUnresolvedVariable
        return json.results
    }
}

function addCards(json, contentType) {
    const card = document.createElement("div")
    const posterContainer = document.createElement("div")
    const poster = document.createElement("img")
    const playContainer = document.createElement("div")
    const play = document.createElement("img")
    const type = document.createElement("span")
    const cardTitle = document.createElement("span")

    card.classList.add("cardContainer__card")
    card.dataset.contentId = json.id
    card.dataset.contentType = contentType
    card.addEventListener("click", function () {
        openDetails(this.dataset.contentType, this.dataset.contentId)
    })
    let isMobile = false
    card.addEventListener("touchstart", function () {
        isMobile = true
        addCardEffect(playContainer, cardTitle, isMobile)
    })
    card.addEventListener("touchend", function () {
        removeCardEffect(playContainer, cardTitle, isMobile)
    })
    card.addEventListener("mouseenter", function () {
        if (isMobile) {
            isMobile = false
            return
        }
        addCardEffect(playContainer, cardTitle, isMobile)
    })
    card.addEventListener("mouseleave", function () {
        if (isMobile) return
        removeCardEffect(playContainer, cardTitle, isMobile)
    })

    let contentDetails
    if (contentType === MOVIE) {
        contentDetails = new Movie(json)
    } else {
        contentDetails = new Serial(json)
    }

    poster.classList.add("cardContainer__posterContainer__poster")
    poster.src = getPosterPath(contentDetails.posterPath)
    poster.alt = contentDetails.title

    play.classList.add("cardContainer__posterContainer__playContainer__play")
    play.src = "icon/play.png"
    play.alt = "play"

    playContainer.classList.add("cardContainer__posterContainer__playContainer")
    playContainer.append(play)

    posterContainer.classList.add("cardContainer__posterContainer")
    posterContainer.append(poster)
    posterContainer.append(playContainer)

    type.classList.add("cardContainer__type")

    if (contentType === MOVIE) {
        type.innerText = "Фильм"
        type.classList.add("cardContainer__typeMovie")
    } else {
        type.innerText = "Сериал"
        type.classList.add("cardContainer__typeSerial")
    }

    cardTitle.classList.add("cardContainer__title")
    cardTitle.innerText = contentDetails.title

    card.append(posterContainer)
    card.append(type)
    card.append(cardTitle)

    if (page > 1) {
        const numberCard = cardContainer.children.length - numberEmptyCards
        const lastCard = cardContainer.children[numberCard]
        cardContainer.insertBefore(card, lastCard)
    } else {
        cardContainer.append(card)
    }
}

function addEmptyCards() {
    for (let i = 0; i < numberEmptyCards; i++) {
        const emptyCard = document.createElement("div")
        emptyCard.classList.add("cardContainer__emptyCard")
        cardContainer.append(emptyCard)
    }
}

async function createButton() {
    const loadNextPage = document.createElement("button")
    loadNextPage.classList.add("loadNextPage")
    loadNextPage.innerText = "Загрузить ещё"
    loadNextPage.addEventListener("click", () => {
        if (!isLoading) {
            isLoading = true
            downloadContent()
        }
    })
    let isMobile = false
    loadNextPage.addEventListener("touchstart", function () {
        isMobile = true
        addButtonEffect(loadNextPage, isMobile)
    })
    loadNextPage.addEventListener("touchend", function () {
        removeButtonEffect(loadNextPage, isMobile)
    })
    loadNextPage.addEventListener("mouseenter", function () {
        if (isMobile) {
            isMobile = false
            return
        }
        addButtonEffect(loadNextPage, isMobile)
    })
    loadNextPage.addEventListener("mouseleave", function () {
        if (isMobile) return
        removeButtonEffect(loadNextPage, isMobile)
    })

    const main = document.querySelector("main")
    main.append(loadNextPage)
}

function openDetails(contentType, contentId) {
    window.location.href = `details.html?contentType=${contentType}&contentId=${contentId}`
}

function addCardEffect(playContainer, cardTitle, isMobile) {
    playContainer.classList.add("playContainerEffect")
    cardTitle.classList.add("titleEffect")
    if (isMobile) return
    playContainer.classList.add("transitionEffect")
    cardTitle.classList.add("transitionEffect")
}

function removeCardEffect(playContainer, cardTitle, isMobile) {
    playContainer.classList.remove("playContainerEffect")
    cardTitle.classList.remove("titleEffect")
    if (isMobile) return
    playContainer.classList.remove("transitionEffect")
    cardTitle.classList.remove("transitionEffect")
}

function addMenuListener(items) {
    let isMobile = false
    items.forEach(item => {
        item.addEventListener("touchstart", function () {
            isMobile = true
            addMenuEffect(item, isMobile)
        })
        item.addEventListener("touchend", function () {
            removeMenuEffect(item, isMobile)
        })
        item.addEventListener("mouseenter", function () {
            if (isMobile) {
                isMobile = false
                return
            }
            addMenuEffect(item, isMobile)
        })
        item.addEventListener("mouseleave", function () {
            if (isMobile) return
            removeMenuEffect(item, isMobile)
        })
    })
}

function addMenuEffect(item, isMobile) {
    item.classList.add("itemEffect")
    if (isMobile) return
    item.classList.add("transitionEffect")
}

function removeMenuEffect(item, isMobile) {
    item.classList.remove("itemEffect")
    if (isMobile) return
    item.classList.remove("transitionEffect")
}

export function addButtonEffect(button, isMobile) {
    button.classList.add("loadNextPageEffect")
    if (isMobile) return
    button.classList.add("transitionEffect")
}

export function removeButtonEffect(button, isMobile) {
    button.classList.remove("loadNextPageEffect")
    if (isMobile) return
    button.classList.remove("transitionEffect")
}

export function startProgress() {
    const progress = document.getElementById("progress")
    progress.classList.add("startProgress")
}

export function stopProgress() {
    const progress = document.getElementById("progress")
    progress.classList.remove("startProgress")
}

export function getPosterPath(posterPath) {
    let posterPathFull
    if (posterPath === null) {
        posterPathFull = "icon/default.png"
    } else {
        posterPathFull = BAS_IMAGE_URL + IMAGE_SIZE + posterPath
    }
    return posterPathFull
}

//noinspection JSUnresolvedVariable
class CinemaDetails {
    constructor(json) {
        const posterPath = json.poster_path
        if (posterPath === undefined || posterPath === null || posterPath === "") {
            this.posterPath = null
        } else {
            this.posterPath = posterPath
        }

        const ratingsTMDb = json.vote_average
        if (ratingsTMDb === undefined || ratingsTMDb === null || ratingsTMDb === "") {
            this.ratingsIMDb = null
        } else {
            this.ratingsIMDb = ratingsTMDb
        }

        const countriesOrigin = json.origin_country
        if (countriesOrigin === undefined || countriesOrigin === null || countriesOrigin.length === 0) {
            this.countriesOrigin = null
        } else {
            this.countriesOrigin = countriesOrigin
        }

        const genres = json.genres
        if (genres === undefined || genres === null || genres.length === 0) {
            this.genres = null
        } else {
            this.genres = genres
        }

        const description = json.overview
        if (description === undefined || description === null || description === "") {
            this.description = null
        } else {
            this.description = description
        }

        const originalLanguage = json.original_language
        if (originalLanguage === undefined || originalLanguage === null || originalLanguage === "") {
            this.originalLanguage = null
        } else {
            this.originalLanguage = originalLanguage
        }
    }
}

//noinspection JSUnresolvedVariable
export class Movie extends CinemaDetails {
    constructor(json) {
        super(json)

        const title = json.title
        if (title === undefined || title === null || title === "") {
            this.title = null
        } else {
            this.title = title
        }

        const time = json.runtime
        if (time === undefined || time === null || time === "") {
            this.time = null
        } else {
            this.time = time
        }

        const releaseDate = json.release_date
        if (releaseDate === undefined || releaseDate === null || releaseDate === "") {
            this.releaseDate = null
        } else {
            this.releaseDate = releaseDate
        }
    }
}

//noinspection JSUnresolvedVariable
export class Serial extends CinemaDetails {
    constructor(json) {
        super(json)

        const title = json.name
        if (title === undefined || title === null || title === "") {
            this.title = null
        } else {
            this.title = title
        }

        const lastEpisode = json.last_episode_to_air
        if (lastEpisode === undefined || lastEpisode === null || lastEpisode === "") {
            this.time = null
        } else {
            const time = lastEpisode.runtime
            if (time === undefined || time === null || time === "") {
                this.time = null
            } else {
                this.time = time
            }
        }

        const releaseDate = json.first_air_date
        if (releaseDate === undefined || releaseDate === null || releaseDate === "") {
            this.releaseDate = null
        } else {
            this.releaseDate = releaseDate
        }
    }
}
