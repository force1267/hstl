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
                    search_instace.close();
                    search_instace.open();
                });
            }
        }
        function searchSubmit(e){
            fetch(`/pat?q=${search.value}`).then(res => res.json()).then(j => {
                // add patient page
            })
            search.value = "";
        }
        submit.onclick = searchSubmit;
        search.onkeypress = e=>e.keyCode==13?searchSubmit(e):null;
    }
});