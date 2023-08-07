//for index.html
const projects = [
    {
        "id": 1,
        "title": "IntelliML",
        "subtitle": "AI based AutoML app",
        "content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut  sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Utenim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. ptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa",
        
    },
    {
        "id": 2,
        "title": "Pacemon",
        "subtitle": "CV based Vehicle monitoring",
        "content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut  sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Utenim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. ptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa",
    },
    {
        "id": 3,
        "title": "Wa-bot",
        "subtitle": "IoT based robot",
        "content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut  sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Utenim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. ptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa",
    },
    {
        "id": 4,
        "title": "Learn Sign",
        "subtitle": "AI and CV based game",
        "content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut  sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Utenim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. ptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa",
    }
]

//project list
let temp = document.getElementById("project_template");
console.log(temp)

for(let i=0;i<projects.length;i++){
    let clone = temp.content.cloneNode(true);
    clone.querySelector("#title").textContent=projects[i].title;
    clone.querySelector("#subtitle").textContent=projects[i].subtitle;
    document.getElementById("work_container").appendChild(clone);
}

//popups
let popup_temp = document.getElementById("project_popup");
console.log(popup_temp)

for(let i=0;i<projects.length;i++){
    let clone = popup_temp.content.cloneNode(true);
    console.log(clone)
    clone.querySelector("#popup_title").textContent=projects[i].title;
    clone.querySelector("#popup_content").textContent=projects[i].content;
    clone.setAttribute("popup_id","popup_"+i);
    document.getElementById("popup_container").appendChild(clone);
}