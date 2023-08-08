tailwind.config = {
    theme: {
      extend: {
        colors: {
          highlight: '#EB5939',
        },
        gridTemplateRows: {
          // Simple 8 row grid
         '12': 'repeat(12, minmax(0, 1fr))',
        },
        fontFamily:{
          'title':"Chesna Medium",
          'special': "Major Mono Display",
          "nav":"Poppins",
          "content": "Chesna Light"
        },
        animation: {
          marquee: 'marquee 10s linear infinite',
        },
        keyframes: {
          marquee: {
            '0%': { transform: 'translateX(0%)' },
            '100%': { transform: 'translateX(-100%)' },
          },
        }
      }
    }
  }

//custom cursor
document.addEventListener('mousemove', (e)=>{
  (document.querySelector('.cursor')).style.left=e.pageX+'px';
  (document.querySelector('.cursor')).style.top=e.pageY+'px';
})


function open_popup(){
  //alert(this.dataset.popup_name);
  var title_div=this.childNodes[3];
  var title = title_div.childNodes[1].innerText.split('\n')[0];
  //console.log(title);
  var popup=document.querySelectorAll(`[data-popup_name=popup-${title}]`);
  popup[0].classList.remove("hidden");
  console.log(popup[0].classList)
}

function close_popup(){
  var parent=this.parentElement;
  console.log(parent.classList);
  parent.classList.add("hidden");

}