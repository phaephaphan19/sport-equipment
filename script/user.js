const userForm = document.getElementById("userForm");
const username = document.getElementById("username");
userForm.addEventListener("submit", function (e) {
    e.preventDefault();

    let formData = new FormData();
    formData.append("username", username.value);

    fetch("/sport_system/php/user.php?action=add_user", {
        method: "POST",
        body: formData
    })
        .then(res => res.json())
        .then(result => {
            console.log(result);
            alert(result.status);
            username.value = "";
            loadUsers();
        });
});

/* ===== โหลดผู้ใช้จาก DB ===== */
const borrowUser = document.getElementById("borrowUser");
function loadUsers() {
    fetch("/sport_system/php/user.php?action=list_user")
        .then(res => res.json())
        .then(users => {
            borrowUser.innerHTML = `
                <option value="">-- เลือกผู้ใช้งาน --</option>
            `;

            users.forEach(user => {
                borrowUser.innerHTML += `
                    <option value="${user.id}">
                        ${user.username}
                    </option>
                `;
            });
        });
}

loadUsers();
