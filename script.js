const fileInput = document.querySelector("#fileInput")
const fileSubmit = document.querySelector("#fileSubmit")
const previewPrompt = document.querySelector("#previewPrompt")
const previewContainer = document.querySelector("#previewContainer")
const errorReports = []
const paperCanvas = document.querySelector("#paperCanvas")

let keywordCounter = {}
let resourceCards;

fileSubmit.onclick = event => {
    const file = fileInput.files[0]

    const reader = new FileReader();

    reader.addEventListener('load', (event) => {
        resourceCards = processData(event.target.result)
    });

    reader.readAsText(file);
}

const processData = (data) => {
    let rows = data.split("\n")
    let resourceCards = []
    let cardKeys = rows[0].slice(0, -1).split("\t")
    // console.log(cardKeys)
    fileInput.classList.add("nondisplay")
    fileSubmit.classList.add("nondisplay")
    previewPrompt.classList.remove("nondisplay")
    window.parent.document.body.style.zoom = .63;
    for (let i = 1; i < rows.length; i++) {
        rows[i] = rows[i].slice(0, -1)
        let card = {}
        let splitRow = rows[i].split("\t")
        splitRow.forEach((text, index) => {
            card[cardKeys[index]] = splitRow[index]
        })
        let cardObject = {}
        cardObject.name = card["Name"]
        cardObject.keywords = sortKeywords(card["Keywords"].split(", "))
        cardObject.keywords.forEach(keyword => {
            if (keywordCounter[keyword]) {
                keywordCounter[keyword] += 1
            } else {
                keywordCounter[keyword] = 1
            }
        })
        cardObject.description = card["Description"]
        cardObject.foodValue = Number(card["Food Value"])
        cardObject.treasureValue = Number(card["Treasure Value"])
        cardObject.quantity = Number(card["Quantity"])
        cardObject.category = card["Category"]
        cardObject.specialRules = Number(card["Special Rules?"]) === "yes"
        cardObject.weapon = Number(card["Weapon?"]) === "yes"
        drawResourceCard(cardObject)
        resourceCards.push(cardObject)
    }

    // console.log("Keyword counter:")
    // console.log(keywordCounter)
    return resourceCards
}

let keywordOrder = {
    magic: 1,
    range: 2,
    blade: 3,
    harpoon: 4,
    iron: 5,
    bone: 6,
    salt: 7,
    poison: 8,
    citrus: 9,
    whiskey: 10,
    fire: 11,
    navigation: 12,
    visibility: 13,
    mending: 14,
    repair: 15,
    medicine: 16,
}

let sortKeywords = (keywords) => {
    let sorted = []
    sorted = keywords.sort((firstItem, secondItem) => keywordOrder[firstItem] - keywordOrder[secondItem]);
    return sorted
}

let makeImage = (src, container, name, description, topContainer, icons) => {
    let picture = document.createElement("img")
    picture.src = src
    picture.onload = () => {
        let totalHeight = name.getBoundingClientRect().height + description.getBoundingClientRect().height + topContainer.getBoundingClientRect().height + icons.getBoundingClientRect().height
        let cardHeight = container.getBoundingClientRect().height
        let relativeHeight = totalHeight / cardHeight

        // console.log(`
        // ITEM: ${name.innerText}
        // RELATIVE HEIGHT: ${totalHeight / cardHeight}/1
        // `)
    
        if (relativeHeight > .4) {
            container.classList.add("compact")
        }
    
        if (relativeHeight > .56) {
            container.classList.add("extra-compact")
        }
    
        if (relativeHeight > .64) {
            container.classList.add("super-compact")
        }
    }
    return picture
}

let drawResourceCard = (card) => {
    let container = document.createElement("div")
    container.className = "card-container"
    
    let topContainer = document.createElement("div")
    topContainer.className = "top-container"
    
    let categoryContainer = document.createElement("div")
    categoryContainer.className = "category-container"

    let valueContainer = document.createElement("div")
    valueContainer.className = "value-container"

    topContainer.append(categoryContainer)
    topContainer.append(valueContainer)
    container.append(topContainer)

    if (["Weapon", "Skill", "Instant"].includes(card.category)) {
        let categoryMarker = document.createElement("div")
        categoryMarker.className = "category-marker"
        categoryMarker.classList.add(`${card.category.toLowerCase()}-marker`)
        categoryMarker.innerText = card.category.toUpperCase()
        categoryContainer.append(categoryMarker)
    }

    if (card.foodValue || card.treasureValue) {
        if (card.foodValue) {
            let foodValue = document.createElement("div")
            foodValue.className = "value-marker"

            let foodNumber = document.createElement("div")
            foodNumber.innerText = card.foodValue

            let foodIcon = document.createElement("img")
            foodIcon.src = "other-icons/food.png"

            foodValue.append(foodNumber)
            foodValue.append(foodIcon)
            valueContainer.append(foodValue)
        }
        if (card.treasureValue) {
            let treasureValue = document.createElement("div")
            treasureValue.className = "value-marker"

            let treasureNumber = document.createElement("div")
            treasureNumber.innerText = card.treasureValue

            let treasureIcon = document.createElement("img")
            treasureIcon.src = "other-icons/treasure.png"

            treasureValue.append(treasureNumber)
            treasureValue.append(treasureIcon)
            valueContainer.append(treasureValue)
        }
    }
    
    let name = document.createElement("div")
    name.className = "card-name"
    name.textContent = card.name
    
    let icons = document.createElement("div")
    icons.className = "resource-icons"
    card.keywords.forEach(keyword => {
        if (!keywordOrder[keyword]) {
            errorReports.push(`Invalid keyword: |${keyword}|`)
        } else {
            let icon = document.createElement("img")
            icon.src = "resource-icons/" + keyword + ".png"
            icon.className="resource-icon"
            icons.append(icon)
        }
    })
    
    previewContainer.append(container)
    
    let description = document.createElement("div")
    description.className = "resource-description"
    description.textContent = card.description
    
    let picture = makeImage("resource-card-pictures/crate.png", container, name, description, topContainer, icons)
    picture.className = "card-picture"
    container.append(picture)
    container.append(name)
    container.append(icons)
    container.append(description)
}

let drawCardsToPaper = () => {
    previewPrompt.classList.add("nondisplay")
    let cards = previewContainer.childNodes
    let pages = []
    for (let i = 0; i - 1 <= cards.length / 4; i++) {
        let newPage = document.createElement("canvas")
        newPage.width = 2550
        newPage.height = 3300
        newPage.className = "paper-canvas"
        pageStack.appendChild(newPage)
        pages.push(newPage)
        const ctx = newPage.getContext("2d");
        ctx.font = "70px sans-serif";
        ctx.fillStyle = "#000";
        ctx.fillText(i + 1, 2350, 3100);
    }

    cards.forEach((card, index) => {
        setTimeout(function () {
            html2canvas(card).then(canvas => {
                let currentPage = pages[Math.floor(index / 4) + 1]
                let x = 0
                let y = 0
                if (index % 4 === 1) {
                    x = 1050
                }
                if (index % 4 === 2) {
                    y = 1450
                }
                if (index % 4 === 3) {
                    x = 1050
                    y = 1450
                }
                canvas.data = {}
                let ctx = currentPage.getContext("2d", { willReadFrequently: true });
                ctx.drawImage(canvas, x + 50, y + 50)
            });
        }, index * (index < 10 ? 3000 : 750))
        console.log(`Timeout set for ${(index < 10 ? 3000 : 750)}`)
    })

    let reportPage = pages[0]
    let reportContext = reportPage.getContext("2d");
    reportContext.font = "70px sans-serif";
    reportContext.fillStyle = "#000";
    let printY = 200
    reportContext.fillText(`${cards.length} Resource Cards`, 100, printY);
    printY += 100
    
    let validKeywords = []

    for (const keyword in keywordCounter) {
        if (keywordOrder[keyword]) {
            validKeywords.push([keyword, keywordCounter[keyword]])
        } else {
            reportContext.fillText(`unrecognized keyword: "${keyword}" (${keywordCounter[keyword]})`, 100, printY);
            printY += 100
        }
    }

    validKeywords = validKeywords.sort((a, b) => {
        return b[1] - a[1]
    })
    console.log("validKeywords:")
    console.log(validKeywords)

    printY += 100
    reportContext.fillText(`Keyword frequency:`, 100, printY);
    printY += 100
    reportContext.fillText(`The most common keyword is ${validKeywords[0][0]}, appearing ${validKeywords[0][1]} times.`, 100, printY);
    reportContext.fillText(`The most common keyword is ${validKeywords[0][0]}, appearing ${validKeywords[0][1]} times.`, 100, printY);
    printY += 100
    for (let i = 1; i < validKeywords.length - 1; i++) {
        let quantity = validKeywords[i][1]
        reportContext.fillText(`${validKeywords[i][0]} -- ${quantity} time${quantity === 1 ? "" : "s"},`, 100, printY);
        printY += 100
    }
    let quantity = validKeywords[validKeywords.length - 1][1]
    if (validKeywords[validKeywords.length - 1][1] !== validKeywords[validKeywords.length - 2][1]) {
        reportContext.fillText(`The least common keyword is ${validKeywords[validKeywords.length - 1][0]}, appearing ${quantity} time${quantity === 1 ? "" : "s"}.`, 100, printY)
    } else {
        reportContext.fillText(`and ${validKeywords[validKeywords.length - 1][0]}, also ${quantity} time${quantity === 1 ? "" : "s"}.`, 100, printY);
    }
}

previewPrompt.onclick = drawCardsToPaper
