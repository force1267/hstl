var patient_shape = null;



document.addEventListener('DOMContentLoaded', function main() {
    M.AutoInit();
    var search = document.querySelectorAll('.autocomplete')[0];
    if(search) {
        var search_instace = M.Autocomplete.getInstance(search);
        var submit = document.getElementById("search-submit");
        search.oninput = function searchUpdateData() {
            if(search.value.length >= 3) {
                fetch(`/search?q=${search.value}`).then(res => res.json()).then(j => {
                    search_instace.updateData(j);
                    // search_instace.close();
                    // search_instace.open();
                });
            }
        }
        function searchSubmit(e){
            fetch(`/pat?q=${search.value}`).then(res => res.json()).then(showPatient)
            search.value = "";
            // search_instace.close();
            // search_instace.open();
        }
        submit.onclick = searchSubmit;
        search.onkeypress = e=>e.keyCode==13?searchSubmit(e):null;

        if(patient_shape === null) {
            fetch("/pshape").then(res => res.json()).then(j => patient_shape = j);
        }

        document.getElementById("button_add").onclick = showAddPatientPanel;
    }
});
function closeWS() {
    document.getElementById("ws").innerHTML = "";
    curPatId = null;
}

var curPatId = null; // current showing patient id
function deletePatient() {
    if(confirm("آیا میخواهید این بیمار را حذف کنید ؟") && curPatId!==null) {
        fetch(`/pat?id=${curPatId}`, {
            method: "DELETE",
            redirect: "follow"
        }).then(res => {
            closeWS();
            alert("بیمار حذف شد");
        });
    }
}
function editPatient() {
    var pat = {
        id: curPatId,
        meli: document.getElementById("شماره ملی").value,
        firstname: document.getElementById("نام").value,
        lastname: document.getElementById("نام خانوادگی").value,
        phone: document.getElementById("تلفن").value,
        gender: document.getElementById("جنسیت").value,
        data: {}
    };
    document.getElementById("شماره ملی").remove();
    document.getElementById("نام").remove();
    document.getElementById("نام خانوادگی").remove();
    document.getElementById("تلفن").remove();
    document.getElementById("جنسیت").remove();
    
    var ins = ws.querySelectorAll("input");
    for(var i of ins) {
        if(i.type === "text") {
            pat.data[i.id] = i.value;
        }
        if(i.type === "checkbox") {
            pat.data[i.id] = i.checked;
        }
    }
    pat.data = JSON.stringify(pat.data);
    fetch("/pat/edit", {
        method: "POST",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
        },
        redirect: "follow",
        body: JSON.stringify(pat),
    })
    .then(res => {
        closeWS();
        alert("مشخصات بیمار تغییر کرد");
    });
}
function addNewPatient() {
    var pat = {
        meli: document.getElementById("شماره ملی").value,
        firstname: document.getElementById("نام").value,
        lastname: document.getElementById("نام خانوادگی").value,
        phone: document.getElementById("تلفن").value,
        gender: document.getElementById("جنسیت").value,
        data: {}
    };
    document.getElementById("شماره ملی").remove();
    document.getElementById("نام").remove();
    document.getElementById("نام خانوادگی").remove();
    document.getElementById("تلفن").remove();
    document.getElementById("جنسیت").remove();
    
    var ins = ws.querySelectorAll("input");
    for(var i of ins) {
        if(i.type === "text") {
            pat.data[i.id] = i.value;
        }
        if(i.type === "checkbox") {
            pat.data[i.id] = i.checked;
        }
    }
    pat.data = JSON.stringify(pat.data);
    fetch("/pat/add", {
        method: "POST",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
        },
        redirect: "follow",
        body: JSON.stringify(pat),
    })
    .then(res => {
        closeWS();
        alert("بیمار اضافه شد");
    });
}
function showAddPatientPanel() {
    var ws = document.getElementById("ws");
    ws.innerHTML = "";
    ws.appendChild(makeInput("نام"));
    ws.appendChild(makeInput("نام خانوادگی"));
    ws.appendChild(makeInput("شماره ملی"));
    ws.appendChild(makeInput("تلفن"));
    ws.appendChild(makeInput("جنسیت"));
    for(var n in patient_shape) {
        if(patient_shape[n] === "box") {
            ws.appendChild(makeCheckbox(n));
        }
        if(patient_shape[n] === "text") {
            ws.appendChild(makeInput(n));
        }
    }
    ws.appendChild(makeIconButton("add", "addNewPatient()", "col s1 offset-s10"));
    ws.appendChild(makeIconButton("close", "closeWS()"));
    M.updateTextFields();
}
function showPatient(pat) {
    curPatId = pat.id;
    console.log("is the patient", pat);
    var ws = document.getElementById("ws");
    ws.innerHTML = "";
    ws.appendChild(makeInput("نام", pat.firstname));
    ws.appendChild(makeInput("نام خانوادگی", pat.lastname));
    ws.appendChild(makeInput("شماره ملی", pat.meli));
    ws.appendChild(makeInput("تلفن", pat.phone));
    ws.appendChild(makeInput("جنسیت", pat.gender));

    var data = JSON.parse(pat.data);
    if(!data) data = {};

    for(var d in data) {
        if(typeof(data[d]) === 'boolean') {
            ws.appendChild(makeCheckbox(d, data[d]));
        }
        if(typeof(data[d]) === 'string') {
            ws.appendChild(makeInput(d, data[d]));
        }
    }
    for(var n in patient_shape) {
        if(!(n in data)) {
            if(patient_shape[n] === "box") {
                ws.appendChild(makeCheckbox(n));
            }
            if(patient_shape[n] === "text") {
                ws.appendChild(makeInput(n));
            }
        }
    }
    ws.appendChild(makeIconButton("edit", "editPatient()", "col s1 offset-s9"));
    ws.appendChild(makeIconButton("delete", "deletePatient()"));
    ws.appendChild(makeIconButton("close", "closeWS()"));
    M.updateTextFields();
}
function makeIconButton(icon, fn, cls = "col s1") {
    var div = document.createElement('div');
    div.setAttribute("class", "");
    div.innerHTML = `
    <div class="${cls}">
        <a onclick="${fn}" style="cursor:pointer">
            <i class="material-icons">${icon}</i>
        </a>
    </div>`
    return div;
}
function makeCheckbox(name, df = false) {
    var div = document.createElement('div');
    div.setAttribute("class", "col s6 offset-s3");
    div.innerHTML = `
    <p>
        <label>
        <input id="${name}" type="checkbox" ${df?'checked="checked"':""}/>
        <span>${name}</span>
        </label>
    </p>`
    return div;
}
function makeInput(name, df = "") {
    var div = document.createElement('div');
    div.setAttribute("class", "input-field col s6 offset-s3");
    div.innerHTML = `
    <input id="${name}" name="${name}" type="text" value="${df?df:""}">
    <label for="${name}">${name}</label>`
    return div;
}
