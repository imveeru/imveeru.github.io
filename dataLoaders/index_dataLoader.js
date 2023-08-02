//for index.html
const projects = [
    {
        "id": 1,
        "title": "IntelliML",
        "subtitle": "AI based AutoML app"
    },
    {
        "id": 2,
        "title": "Pacemon",
        "subtitle": "CV based Vehicle monitoring"
    },
    {
        "id": 3,
        "title": "Wa-bot",
        "subtitle": "IoT based robot"
    },
    {
        "id": 4,
        "title": "Learn Sign",
        "subtitle": "AI and CV based game"
    }
]

//console.log(projects.length)

let temp = document.getElementById("project_template");
console.log(temp)

for(let i=0;i<projects.length;i++){
    let clone = temp.content.cloneNode(true);
    clone.querySelector("#title").textContent=projects[i].title;
    clone.querySelector("#subtitle").textContent=projects[i].subtitle;
    document.getElementById("work_container").appendChild(clone);
}