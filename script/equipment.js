const equipmentForm = document.getElementById("equipmentForm");
const equipmentName = document.getElementById("equipmentName");
const equipmentTotal = document.getElementById("equipmentTotal");

/* ===== โหลดอุปกรณ์ ===== */
function loadEquipment() {
    fetch("/sport_system/php/equipment.php?action=list_equipment")
        .then(res => res.json())
        .then(items => {
            borrowEquipment.innerHTML = "";

            items.forEach(item => {

                // ถ้าอุปกรณ์หมด ให้เลือกไม่ได้
                let disabled = item.available == 0 ? "disabled" : "";

                borrowEquipment.innerHTML += `
                    <option value="${item.id}" ${disabled}>
                        ${item.equipment_name}
                        (เหลือ ${item.available}/${item.total})
                    </option>
                `;
            });
        });
}


/* ===== เพิ่มอุปกรณ์ ===== */
equipmentForm.addEventListener("submit", function (e) {
    e.preventDefault();

    let formData = new FormData();
    formData.append("equipment_name", equipmentName.value);
    formData.append("total", equipmentTotal.value);

    fetch("/sport_system/php/equipment.php?action=add_equipment", {
        method: "POST",
        body: formData
    })
        .then(res => res.json())
        .then(result => {
            alert(result.status);
            equipmentName.value = "";
            equipmentTotal.value = "";
            loadEquipment();
            renderStockFromDB();
        });
});

const stockTable = document.getElementById("stockTable");
function renderStockFromDB() {

    console.log("renderStockFromDB called");

    fetch("/sport_system/php/equipment.php?action=list_equipment")
        .then(res => res.json())
        .then(items => {

            console.log("TYPE:", typeof items);
            console.log("DATA:", items);

            stockTable.innerHTML = "";

            items.forEach(eq => {
                stockTable.innerHTML += `
                    <tr>
                        <td>${eq.equipment_name}</td>
                        <td>${eq.total}</td>
                        <td>${eq.available}</td>
                        <td>
                            <button class="delete-btn" onclick="deleteEquipment(${eq.id})">
                                🗑 ลบ
                            </button>
                        </td>
                    </tr>
                `;
            });
        });
}


function deleteEquipment(id) {
    if (!confirm("ยืนยันการลบอุปกรณ์นี้?")) return;

    let formData = new FormData();
    formData.append("id", id);

    fetch("/sport_system/php/equipment.php?action=delete_equipment", {
        method: "POST",
        body: formData
    })
        .then(res => res.json())
        .then(result => {
            alert(result.status);
            renderStockFromDB();
            loadEquipment();
        });
}

function loadBorrowEquipment() {
    const borrowEquipment = document.getElementById("borrowEquipment");
    if (!borrowEquipment) return;

    fetch("/sport_system/php/equipment.php?action=list_equipment")
        .then(res => res.json())
        .then(items => {

            borrowEquipment.innerHTML = "";

            items.forEach(item => {
                borrowEquipment.innerHTML += `
                    <option value="${item.id}">
                        ${item.equipment_name} (คงเหลือ ${item.available})
                    </option>
                `;
            });
        });
}

/* ===== โหลดเมื่อเปิดหน้าเว็บ ===== */
loadEquipment();
renderStockFromDB();
