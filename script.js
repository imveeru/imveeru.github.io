const load = gsap.timeline({
    paused: "true"
})
load.to("#percent , #bar", {
    duration: .2,
    opacity: 0,
    zIndenav: -1
})
load.to(".progress",{
    duration: .8,
    width: "0%"
})
load.from(".content", {
    duration: .8,
    opacity: 0,
    ease: "Power4.out"
}, "-=.5")
load.from(".content h1", {
    duration: .5,
    y: 50,
    skewY: 10,
    opacity: 0
},"-=1")

var id, width = 1;
function loading(){
    id = setInterval(frame, 25);
}
function frame(){
    if(width>=100){
        clearInterval(id)
        load.play();
    }
    else{
        width++;
        document.getElementById("barconfirm").style.width = width + '%';
        document.getElementById("percent").innerHTML = width + '%';
    }
}

window.onload = function(){
    loading()
}

window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    document.getElementById("nav-bar").style.top = "0";
  } else {
    document.getElementById("nav-bar").style.top = "-50px";
  }
} 


//Cursor
const cursor = document.querySelector(".cursor");

window.addEventListener("mousemove", (e) => {
  cursor.style.left = e.pageX + "px";
  cursor.style.top = e.pageY + "px";
  cursor.setAttribute("data-fromTop", cursor.offsetTop - scrollY);
  // console.log(e)
});
window.addEventListener("scroll", () => {
  const fromTop = cursor.getAttribute("data-fromTop");
  cursor.style.top = scrollY + parseInt(fromTop) + "px";
  console.log(scrollY);
});
window.addEventListener("click", () => {
  if (cursor.classList.contains("click")) {
    cursor.classList.remove("click");
    void cursor.offsetWidth; // trigger a DOM reflow
    cursor.classList.add("click");
  } else {
    cursor.classList.add("click");
  }
});