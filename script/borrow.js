let borrowPage = 1;
let historyPage = 1;

/* ================= โหลดอุปกรณ์เข้า select ================= */

function loadBorrowEquipment() {
    const borrowEquipment = document.getElementById("borrowEquipment");
    if (!borrowEquipment) return;

    fetch("/php/equipment.php?action=list_equipment")
        .then(res => res.json())
        .then(items => {
            borrowEquipment.innerHTML = `<option value="">-- เลือกอุปกรณ์ --</option>`;

            items.forEach(item => {
                borrowEquipment.innerHTML += `
                    <option value="${item.id}">
                        ${item.equipment_name} (คงเหลือ ${item.available})
                    </option>
                `;
            });
        });
}

/* ================= ตารางกำลังยืม ================= */

function loadBorrowTable(page = 1) {
    const borrowTable = document.getElementById("borrowTable");
    const borrowPagination = document.getElementById("borrowPagination");
    if (!borrowTable) return;

    fetch(`/php/borrow.php?action=list_borrowed&page=${page}`)
        .then(res => res.json())
        .then(result => {
            borrowTable.innerHTML = "";

            result.data.forEach(row => {
                borrowTable.innerHTML += `
                    <tr>
                        <td>${row.username}</td>
                        <td>${row.equipment_code}</td>
                        <td>${row.equipment_name}</td>
                        <td>${row.qty}</td>
                        <td>${row.borrow_date}</td>
                        <td>
                            <button onclick="returnEquipment(${row.id})">
                                🔁 คืนอุปกรณ์
                            </button>
                        </td>
                    </tr>
                `;
            });

            renderBorrowPagination(result.totalPages, result.currentPage);
        });
}
function renderBorrowPagination(totalPages, currentPage) {
    const el = document.getElementById("borrowPagination");
    if (!el) return;

    el.innerHTML = "";

    for (let i = 1; i <= totalPages; i++) {
        el.innerHTML += `
            <button onclick="loadBorrowTable(${i})"
                style="margin:3px;padding:6px 12px;
                background:${i === currentPage ? '#2196f3' : '#d0d7de'};
                border:none;border-radius:5px;">
                ${i}
            </button>
        `;
    }
}
/* ================= ตารางประวัติ ================= */

function loadHistoryTable(page = 1) {
    const historyTable = document.getElementById("historyTable");
    const historyPagination = document.getElementById("historyPagination");
    if (!historyTable) return;

    fetch(`/php/borrow.php?action=list_history&page=${page}`)
        .then(res => res.json())
        .then(result => {
            historyTable.innerHTML = "";

            result.data.forEach(row => {
                historyTable.innerHTML += `
                    <tr>
                        <td>${row.username}</td>
                        <td>${row.equipment_code}</td>
                        <td>${row.equipment_name}</td>
                        <td>${row.qty}</td>
                        <td>${row.borrow_date}</td>
                        <td>${row.return_date ?? '-'}</td>
                        <td>
                            ${row.status === 'borrowed' ? '🟡 กำลังยืม' : '🟢 คืนแล้ว'}
                        </td>
                    </tr>
                `;
            });

            renderHistoryPagination(result.totalPages, result.currentPage);
        });
}

function renderHistoryPagination(totalPages, currentPage) {
    const el = document.getElementById("historyPagination");
    if (!el) return;

    el.innerHTML = "";

    for (let i = 1; i <= totalPages; i++) {
        el.innerHTML += `
            <button onclick="loadHistoryTable(${i})"
                style="margin:3px;padding:6px 12px;
                background:${i === currentPage ? '#9c27b0' : '#d0d7de'};
                border:none;border-radius:5px;">
                ${i}
            </button>
        `;
    }
}

/* ================= คืนอุปกรณ์ ================= */

function returnEquipment(borrow_id) {
    if (!confirm("ยืนยันการคืนอุปกรณ์?")) return;

    let formData = new FormData();
    formData.append("borrow_id", borrow_id);

    fetch("/php/borrow.php?action=return_equipment", {
        method: "POST",
        body: formData
    })
        .then(res => res.json())
        .then(result => {
            alert(result.message);

            if (result.status === "success") {
                loadBorrowEquipment();
                loadBorrowTable(borrowPage);
                loadHistoryTable(historyPage);
            }
        });
}

 /* ===== รีเซตประวัติ ===== */

    const resetHistoryBtn = document.getElementById("resetHistoryBtn");

    if (resetHistoryBtn) {
        resetHistoryBtn.addEventListener("click", function () {

            if (!confirm("คุณต้องการลบประวัติการยืม–คืนทั้งหมดหรือไม่?")) {
                return;
            }

            fetch("/php/borrow.php?action=reset_history", {
                method: "POST"
            })
            .then(res => res.json())
            .then(result => {
                alert(result.message);

                if (result.status === "success") {
                    historyPage = 1;
                    loadHistoryTable(1);
                }
            })
            .catch(err => console.error("reset_history error:", err));
        });
    }

/* ================= ฟอร์มยืม ================= */

document.addEventListener("DOMContentLoaded", function () {

    loadBorrowEquipment();
    loadBorrowTable(1);
    loadHistoryTable(1);

    const borrowForm = document.getElementById("borrowForm");

    if (borrowForm) {
        borrowForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const borrowUser = document.getElementById("borrowUser");
            const borrowEquipment = document.getElementById("borrowEquipment");
            const borrowQty = document.getElementById("borrowQty");

            let formData = new FormData();
            formData.append("user_id", borrowUser.value);
            formData.append("equipment_id", borrowEquipment.value);
            formData.append("qty", borrowQty.value);

            fetch("/php/borrow.php?action=borrow_equipment", {
                method: "POST",
                body: formData
            })
                .then(res => res.json())
                .then(result => {
                    alert(result.message);

                    if (result.status === "success") {
                        loadBorrowEquipment();
                        loadBorrowTable(1);
                        loadHistoryTable(1);
                    }
                });
        });
    }

});
