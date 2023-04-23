// html2canvas(document.querySelector("#capture")).then(canvas => {
//     document.body.append(canvas)
// });

const fileInput = document.querySelector("#fileInput")
const fileSubmit = document.querySelector("#fileSubmit")
const errorReports = []

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
    let cardKeys = rows[0].split("\t")
    console.log(cardKeys)
    fileInput.classList.add("nondisplay")
    fileSubmit.classList.add("nondisplay")
    window.parent.document.body.style.zoom = .63;
    for (let i = 1; i < rows.length; i++) {
        let card = {}
        let splitRow = rows[i].split("\t")
        splitRow.forEach((text, index) => {
            card[cardKeys[index]] = splitRow[index]
        })
        let cardObject = {}
        cardObject.name = card["Name"]
        cardObject.keywords = sortKeywords(card["Keywords"].split(", "))
        cardObject.description = card["Description"]
        cardObject.foodValue = Number(card["Food Value"])
        cardObject.treasureValue = Number(card["Treasure Value"])
        cardObject.quantity = Number(card["Quantity"])
        cardObject.specialRules = Number(card["Special Rules?"]) === "yes"
        cardObject.weapon = Number(card["Weapon?"]) === "yes"
        drawResourceCard(cardObject)
        resourceCards.push(cardObject)
    }

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

let drawResourceCard = (card) => {
    let container = document.createElement("div")
    container.className = "card-container"

    let valueContainer = document.createElement("div")
    valueContainer.className = "value-container"
    container.append(valueContainer)

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

    let picture = document.createElement("img")
    picture.className = "card-picture"
    picture.src = "resource-card-pictures/crate.png"
    container.append(picture)
    
    let name = document.createElement("div")
    name.className = "card-name"
    name.textContent = card.name
    container.append(name)

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
    container.append(icons)
    
    document.body.append(container)
    
    let description = document.createElement("div")
    description.className = "resource-description"
    description.textContent = card.description
    container.append(description)

    let totalHeight = name.getBoundingClientRect().height + description.getBoundingClientRect().height + valueContainer.getBoundingClientRect().height

    console.log(`
    ITEM: ${card.name}
    TOTAL HEIGHT: ${totalHeight}
    `)

    if (totalHeight > 160) {
        container.classList.add("compact")
    }

    if (totalHeight > 236) {
        container.classList.add("extra-compact")
    }

    if (totalHeight > 300) {
        container.classList.add("super-compact")
    }
}

console.log("Errors:")
console.log(errorReports)