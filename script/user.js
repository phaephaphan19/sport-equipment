document.addEventListener("DOMContentLoaded", () => {

    const userForm = document.getElementById("userForm");
    const username = document.getElementById("username");
    const borrowUser = document.getElementById("borrowUser");

    /* ================= เพิ่มผู้ใช้ ================= */

    if (userForm) {
        userForm.addEventListener("submit", function (e) {
            e.preventDefault();

            if (username.value.trim() === "") {
                alert("กรุณากรอกชื่อผู้ใช้");
                return;
            }

            let formData = new FormData();
            formData.append("username", username.value);

            fetch("/php/user.php?action=add_user", {
                method: "POST",
                body: formData
            })
                .then(res => res.json())
                .then(result => {
                    console.log(result);
                    alert(result.status);

                    if (result.status === "success") {
                        username.value = "";
                        loadUsers();
                    }
                })
                .catch(err => {
                    console.error("Add user error:", err);
                    alert("เกิดข้อผิดพลาดในการเพิ่มผู้ใช้");
                });
        });
    }

    /* ================= โหลดผู้ใช้จาก DB ================= */

    function loadUsers() {

        if (!borrowUser) return;

        fetch("/php/user.php?action=list_user")
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
            })
            .catch(err => {
                console.error("Load users error:", err);
            });
    }

    /* ================= โหลดเมื่อเปิดหน้า ================= */

    loadUsers();

});
