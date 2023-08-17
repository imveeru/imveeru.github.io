//for index.html
const projects = [
    {
        "id": 1,
        "title": "IntelliML",
        "subtitle": "Data transformed to Insights, Instantly",
        "content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut  sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Utenim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. ptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa",
        "cover_img":"/assets/images/projects/intelliml.jpg",
        "tools":["Python","LangChain","PalmAPI"],
        "img":"/assets/images/popup/IntelliML-cover.webp",
        "link":"https://intelliml.streamlit.app/"
    },
    {
        "id": 3,
        "title": "Wa-bot",
        "subtitle": "Seamless Delivery Automation Robots",
        "content":"Revolutionizing Warehouse Delivery with Autonomous Robots. Witness the future of efficient product delivery within warehouses through our impressive creation, Wa-Bot. Powered by batteries and driven by innovation, this autonomous path follower robot is a game-changer. The prototype was meticulously crafted using Arduino and ESP, showcasing cutting-edge technology in action. Complementing this hardware marvel is our user-friendly web application, developed using React, JavaScript, and Firebase. Seamlessly order and pay for products, effortlessly harnessing the potential of modern technology to enhance the warehouse experience.",
        "cover_img":"/assets/images/projects/wabot.jpg",
        "tools":["Arduino","JavaScript","React","Firebase","TailwindCSS"],
        "img":"/assets/images/popup/IntelliML-cover.webp",
        "link":"https://github.com/imveeru/warehouse_mgmt"
    },
    {
        "id": 4,
        "title": "LearnSign",
        "subtitle": "Express yourself beyond words",
        "content":"An interactive Sign Language Learning Companion. Embark on a transformative linguistic adventure with Learn Sign, a cutting-edge web application meticulously crafted using Python, TensorFlow, and ReactJS. This innovative platform introduces an exhilarating approach to mastering American, Indian, and South Korean Sign Languages. Engage in captivating gamified lessons, while real-time hand gesture recognition, powered b TensorFlow, guides your progress. Unveil the enchanting world of sign languages through Learn Sign, where inclusivity, and seamless learning converge for an unmatched educational experience.",
        "cover_img":"/assets/images/projects/learnsign.jpg",
        "tools":["TensorFlow","JavaScript","React"],
        "img":"/assets/images/popup/IntelliML-cover.webp",
        "link":""
    }
]

//project list
let temp = document.getElementById("project_template");
//console.log(temp)

for(let i=0;i<projects.length;i++){
    let clone = temp.content.cloneNode(true);
    clone.querySelector("#title").textContent=projects[i].title;
    clone.querySelector("#subtitle").textContent=projects[i].subtitle;
    clone.querySelector("#project_box").dataset.popup_name="popup-"+projects[i].title;
    clone.querySelector("#coverimg").src=projects[i].cover_img;
    document.getElementById("ui-container").appendChild(clone);
}

//popups
let popup_temp = document.getElementById("project_popup");
console.log(popup_temp)

for(let i=0;i<projects.length;i++){
    let clone = popup_temp.content.cloneNode(true);
    console.log(clone);
    clone.querySelector("#popup_title").textContent=projects[i].title;
    clone.querySelector("#popup_content").textContent=projects[i].content;
    clone.querySelector("#popup_box").dataset.popup_name="popup-"+projects[i].title;
    clone.querySelector("#popup_image").src=projects[i].img;
    clone.querySelector("#project_link").href=projects[i].link;
    let tools_used = clone.querySelector("#tools_used");
    console.log(tools_used)
    for(let j=0;j<projects[i].tools.length;j++){
        console.log(projects[i].tools[j]);
        tools_used.innerHTML+=`<p><span class="inline"><img class="h-8 rounded-xl mr-2 inline" src="./assets/images/tools/${projects[i].tools[j]}.webp"/></span>${projects[i].tools[j]}</p>`
        //tools_used.appendChild(`<p><span class="inline"><img class="h-8 rounded-xl mr-2 inline" src="./assets/images/tools/Python.jpg"/></span>${projects[i]}</p>`)
    }

    //console.log(clone.querySelector("#popup_box").dataset.popup_name);
    document.getElementById("popup_container").appendChild(clone);
}

