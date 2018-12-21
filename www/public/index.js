var patient_shape = null;

document.addEventListener('DOMContentLoaded', function main() {
    M.AutoInit();
    var search = document.querySelectorAll('.autocomplete')[0];
    if(search) {
        var search_instace = M.Autocomplete.getInstance(search);
        var submit = document.getElementById("search-submit");
        search.oninput = function searchUpdateData() {
            if(search.value.length >= 1) {
                fetch(`/search?q=${search.value}`).then(res => res.json()).then(j => {
                    var o = {};
                    for(var i of j) {
                        o["@" + i] = null;
                    }
                    search_instace.updateData(o);
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
        document.getElementById("button_settings").onclick = showSettings;
    }
});
function closeWS() {
    document.getElementById("ws").innerHTML = "";
    curPatId = null;
    curUser = null;
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



function showSettings() {
    closeWS();
    var ws = document.getElementById("ws");
    ws.appendChild(makeP("تنظیمات", "center-align"));
    ws.appendChild(makeP("لیستی از تمام بیماران دریافت کنید.", "center-align"));
    ws.appendChild(makeButton("list", "لیست بیماران", "showAllPatients()", "center-align"));
    ws.appendChild(makeP("کلمه عبورتان را عوض کنید.", "center-align"));
    ws.appendChild(makeInput("کلمه عبور جدید", "", "col s10 offset-s1"));
    ws.appendChild(makeInput("تکرار کلمه عبور جدید", "", "col s10 offset-s1"));
    ws.appendChild(makeButton("vpn_key", "تغییر", `changePassword('کلمه عبور جدید', 'تکرار کلمه عبور جدید')`, "center-align"));
    var access = document.createElement('div');
    ws.appendChild(access);
    ws.appendChild(makeP("خروج از برنامه.", "center-align"));
    ws.appendChild(makeButton("logout", "خروج", "logout()", "center-align"));

    var mod = document.createElement('div');
    mod.appendChild(makeP("اطلاعاتی که در مورد بیماران نگه میدارید را مدیریت کنید.", "center-align"));
    mod.appendChild(makeButton("format_list_numbered", "مدیریت اطلاعات", "showEditShapePanel()", "center-align"));
    var admin = document.createElement('div');
    admin.appendChild(makeP("لیست بیماران را به صورت مجموعه‌ای در قالب فایل excel اضافه کنید.", "center-align"));
    admin.appendChild(makeButton("grid_on", "بارگذاری excel", "uploadExcel()", "center-align"));
    admin.appendChild(makeP("کاربران برنامه را مدیریت کنید. کلمه های عبور را تغییر دهید یا کاربر جدید اضافه کنید.", "center-align"));
    admin.appendChild(makeButton("group", "کاربران", "showUsersPanel()", "center-align"));
    admin.appendChild(makeP("از بانک اطلاعات نسخه پشتیبان بگیرید یا یک نسخه پشتیبان را بازنشانی کنید.", "center-align"));
    admin.appendChild(makeButton("cloud_download", "دریافت نسخه پشتیبان", "downloadDB()", "center-align"));
    admin.appendChild(makeButton("cloud_upload", "بازنشانی نسخه پشتیبان", "uploadDB()", "center-align"));
    var dev = document.createElement('div');
    dev.appendChild(makeP("سلام برنامه نویس !", "center-align"));
    dev.appendChild(makeButton("priority_high", "Factory Reset", "resetDB()", "center-align"));
    dev.appendChild(makeButton("http", "ping", "window.location.replace('/ping')", "center-align"));

    ws.appendChild((e=>(e.innerText = "نرم افزار مدیریت اطلاعات بیماران. دانشگاه مازندران. ۱۳۹۷ نسخه آزمایشی",e))(document.createElement('p')));

    fetch("/whoami").then(r => r.json()).then(r => {
        if(r.access >= 3) {
            access.appendChild(mod)
        }
        if(r.access >= 5) {
            access.appendChild(admin)
        }
        if(r.access >= 7) {
            access.appendChild(dev)
        }
    })

    M.updateTextFields();
}

function showAllPatients() {
    closeWS();
    var ws = document.getElementById("ws");
    var coll = document.createElement('div');
    coll.setAttribute("class", "collection with-header");
    coll.setAttribute("dir", "rtl");
    var header = document.createElement('div');
    header.setAttribute("class", "collection-header");
    header.innerHTML = `<div class="collection-header"><h4>بیماران</h4></div>`;
    coll.appendChild(header);
    ws.appendChild(coll);
    fetch("/pat?all=1").then(r => r.json()).then(rows => {
        for(var pat of rows) {
            var item = document.createElement('a');
            item.pat = pat;
            item.setAttribute("class", "collection-item");
            item.innerText = `@${pat.id} ${pat.firstname} ${pat.lastname} ${pat.meli}`;
            coll.appendChild(item);
            // item.setAttribute("href", "#!");
            item.onclick = e => showPatient(e.target.pat);
        }
    })
}
function showEditShapePanel() {
    // TODO
}

var curUser = null; // current showing user
function deleteUser() {
    if(confirm("آیا میخواهید این کاربر را حذف کنید ؟") && curUser!==null) {
        fetch(`/user?id=${curUser.id}`, {
            method: "DELETE",
            redirect: "follow"
        }).then(res => {
            closeWS();
            alert("کاربر حذف شد");
        });
    }
}
function editUser() {
    var user = curUser;
    var newUser = {
        id: user.id,
        password: document.getElementById("کلمه عبور").value,
        firstname: document.getElementById("نام").value,
        lastname: document.getElementById("نام خانوادگی").value,
        phone: document.getElementById("تلفن").value,
        username: document.getElementById("نام کاربری").value,
        access: document.getElementById("دسترسی").value,
    };
    fetch("/whoami").then(r => r.json()).then(me => {
        if(me.access < parseInt(newUser.access)){
            alert("دسترسی کاربر نمیتواند بیشتر از شما باشد.");
        } else if(newUser.password === "") {
            alert("کلمه عبور جدید انتخاب کنید.");
        } else fetch("/user/edit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8",
            },
            redirect: "follow",
            body: JSON.stringify(newUser),
        }).then(res => {
            closeWS();
            alert("مشخصات کاربر تغییر کرد");
        });
    });
}
function addNewUser() {
    var newUser = {
        password: document.getElementById("کلمه عبور").value,
        firstname: document.getElementById("نام").value,
        lastname: document.getElementById("نام خانوادگی").value,
        phone: document.getElementById("تلفن").value,
        username: document.getElementById("نام کاربری").value,
        access: document.getElementById("دسترسی").value,
    };
    fetch("/whoami").then(r => r.json()).then(me => {
        if(me.access < parseInt(newUser.access)){
            alert("دسترسی کاربر نمیتواند بیشتر از شما باشد.");
        } else if(newUser.password === "") {
            alert("کلمه عبور جدید انتخاب کنید.");
        } else fetch("/user/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8",
            },
            redirect: "follow",
            body: JSON.stringify(newUser),
        }).then(res => {
            closeWS();
            alert("کاربر جدید اضافه شد");
        });
    });
}
function showAddUserPanel() {
    closeWS();
    var ws = document.getElementById("ws");
    ws.innerHTML = "";
    ws.appendChild(makeInput("نام"));
    ws.appendChild(makeInput("نام خانوادگی"));
    ws.appendChild(makeInput("نام کاربری"));
    ws.appendChild(makeInput("تلفن"));
    ws.appendChild(makeInput("دسترسی"));
    ws.appendChild(makeInput("کلمه عبور"));
    
    ws.appendChild(makeIconButton("add", "addNewUser()", "col s1 offset-s10"));
    ws.appendChild(makeIconButton("close", "closeWS()"));
    M.updateTextFields();
}
function showUser(user) {
    fetch("/whoami").then(r => r.json()).then(me => {
        if(me.access >= user.access) {
            closeWS();
            curUser = user;
            var ws = document.getElementById("ws");
            ws.appendChild(makeInput("نام", user.firstname));
            ws.appendChild(makeInput("نام خانوادگی", user.lastname));
            ws.appendChild(makeInput("تلفن", user.phone));
            ws.appendChild(makeInput("نام کاربری", user.username));
            ws.appendChild(makeInput("دسترسی", user.access));
            ws.appendChild(makeInput("کلمه عبور", ""));

            ws.appendChild(makeIconButton("edit", "editUser()", "col s1 offset-s9"));
            ws.appendChild(makeIconButton("delete", "deleteUser()"));
            ws.appendChild(makeIconButton("close", "closeWS()"));
            M.updateTextFields();
        } else {
            alert("شما نمیتوانید اطلاعات کاربری با دسترسی بیشتر از خودتان را تغییر دهید");
        }
    })
}
function showUsersPanel() {
    closeWS();
    var ws = document.getElementById("ws");
    var coll = document.createElement('div');
    coll.setAttribute("class", "collection with-header");
    coll.setAttribute("dir", "rtl");
    var header = document.createElement('div');
    header.setAttribute("class", "collection-header");
    header.innerHTML = `<div class="collection-header"><h4>کاربران</h4></div>`;
    coll.appendChild(header);
    ws.appendChild(coll);
    fetch("/user?all=1").then(r => r.json()).then(rows => {
        for(var user of rows) {
            var item = document.createElement('a');
            item.user = user;
            item.setAttribute("class", "collection-item");
            item.innerText = `@${user.id} ${user.firstname} ${user.lastname} حساب کاربری:${user.username} تماس:${user.phone} دسترسی:${user.access}`;
            coll.appendChild(item);
            // item.setAttribute("href", "#!");
            item.onclick = e => showUser(e.target.user);
        }
    });
    ws.appendChild(makeButton("add", "کاربر جدید", "showAddUserPanel()", "center-align"));
}
function changePassword(i1, i2) {
    var v1 = document.getElementById(i1).value;
    var v2 = document.getElementById(i2).value;
    document.getElementById(i1).value = document.getElementById(i2).value = "";
    if(v1 === v2) {
        fetch("/cp", {
            method: "POST",
            body: JSON.stringify({ password: v1 }),
            headers: {
                "Content-Type": "application/json; charset=utf-8",
            },
            redirect: "follow",
        }).then(r=>alert("رمز عبور تغییر کرد"));
    } else {
        alert("ورودی ها باید یکی باشند !");
    }
}
function uploadExcel() {
    // TODO
}
function downloadDB() {
    // TODO
}
function uploadDB() {
    // TODO
}
function resetDB() {
    // TODO
}
function logout() {
    fetch("/logout").then(r => window.location.replace("/"));
}

function makeP(text, cls = "") {
    var p = document.createElement('p');
    p.setAttribute("class", "flow-text " + cls);
    p.setAttribute("dir", "rtl");
    p.setAttribute("lang", "fa");
    p.innerText = text;
    return p;
}
function makeButton(icon, name, fn, cls = "") {
    var div = document.createElement('div');
    div.setAttribute("class", cls);
    div.innerHTML = `
    <a class="btn btn-flat teal waves-effect waves-light" onclick="${fn}" style="cursor:pointer">
        ${icon != false ? `<i class="material-icons right">${icon}</i>` : ""}<span>${name}</span>
    </a>`
    return div;
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
function makeInput(name, df = "", cls = false) {
    var div = document.createElement('div');
    div.setAttribute("class", cls !== false ? "input-field " + cls : "input-field col s6 offset-s3");
    div.innerHTML = `
    <input id="${name}" name="${name}" type="text" value="${df?df:""}">
    <label for="${name}">${name}</label>`
    return div;
}
