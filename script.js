let testElement = document.createElement("div")
let testImage = document.createElement("img")
let container = document.createElement("div")
testImage.src = "v.jpg"
testElement.textContent = "I can think of no reason the gunpowder treason should ever be forgot."

container.append(testImage)
container.append(testElement)
container.id = "capture"

document.body.append(container)

html2canvas(document.querySelector("#capture")).then(canvas => {
    document.body.appendChild(canvas)
});