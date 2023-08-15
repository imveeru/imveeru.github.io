const section = document.querySelector("#skew")

let currentPixel = window.pageYOffset
console.log(currentPixel )

const looper = function () {
	const newPixel = window.pageYOffset
	const diff = newPixel - currentPixel
	const speed = diff * .2
	section.style.transform = "skewY(" + speed + "deg)"
	currentPixel = newPixel
	requestAnimationFrame(looper)
}

looper();