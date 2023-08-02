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

//preloader

//text reveal animation
// let paragraphs = [...document.querySelectorAll('p')];
// let spans = [];

// paragraphs.forEach(paragraph => {
//     let htmlString = '';
//     let pArray = paragraph.textContent.split('');

//     for (let i = 0; i < pArray.length; i++) {
//         htmlString += `<span>${pArray[i]}</span>`;
//     }

//     paragraph.innerHTML = htmlString;
// });

// spans = [...document.querySelectorAll('span')];

// function revealSpans() {
//     for (let i = 0; i < spans.length; i++) {
//         if (spans[i].parentElement.getBoundingClientRect().top < window.innerHeight / 2) {
//             let { left, top } = spans[i].getBoundingClientRect();
//             top = top - (window.innerHeight * 0.2);

//             let opacityValue = 1 - ((top * 0.01) + (left * 0.001));
//             opacityValue = opacityValue < 0.1 ? 0.1 : opacityValue > 1 ? 1 : opacityValue.toFixed(3);
            
//             spans[i].style.opacity = opacityValue;
//         }
//     }
// }

// window.addEventListener('scroll', revealSpans);
// revealSpans();