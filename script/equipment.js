const equipmentForm = document.getElementById("equipmentForm");
const equipmentCode = document.getElementById("equipmentCode");
const equipmentName = document.getElementById("equipmentName");
const equipmentTotal = document.getElementById("equipmentTotal");
const stockTable = document.getElementById("stockTable");

/* ===== โหลดอุปกรณ์ลง select ===== */
function loadEquipment() {
    const borrowEquipment = document.getElementById("borrowEquipment");
    if (!borrowEquipment) return; // ถ้าไม่มี select นี้ ให้ข้าม

    fetch("php/equipment.php?action=list_equipment")
        .then(res => res.json())
        .then(items => {
            borrowEquipment.innerHTML = "";

            items.forEach(item => {
                let disabled = item.available == 0 ? "disabled" : "";

                borrowEquipment.innerHTML += `
                    <option value="${item.id}" ${disabled}>
                        ${item.equipment_code} ${item.equipment_name} (เหลือ ${item.available}/${item.total})
                    </option>
                `;
            });
        })
        .catch(err => console.error("loadEquipment error:", err));
}

/* ===== เพิ่มอุปกรณ์ ===== */
if (equipmentForm) {
    equipmentForm.addEventListener("submit", function (e) {
        e.preventDefault();
        let formData = new FormData();
        console.log(equipmentCode.value);
        formData.append("equipment_code", equipmentCode.value);
        formData.append("equipment_name", equipmentName.value);
        formData.append("total", equipmentTotal.value);

        fetch("php/equipment.php?action=add_equipment", {
            method: "POST",
            body: formData
        })
            .then(res => res.json())
            .then(result => {
                alert(result.status);
            	equipmentCode.value = "";
                equipmentName.value = "";
                equipmentTotal.value = "";
                loadEquipment();
                renderStockFromDB();
            })
            .catch(err => console.error("add_equipment error:", err));
    });
}

/* ===== แสดงสต็อกจาก DB ===== */
function renderStockFromDB() {
    if (!stockTable) return;

    fetch("php/equipment.php?action=list_equipment")
        .then(res => res.json())
        .then(items => {
            stockTable.innerHTML = "";

            items.forEach(eq => {
                stockTable.innerHTML += `
                    <tr>
                    	<td>${eq.equipment_code}</td>
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
        })
        .catch(err => console.error("renderStockFromDB error:", err));
}

/* ===== ลบอุปกรณ์ ===== */
function deleteEquipment(id) {
    if (!confirm("ยืนยันการลบอุปกรณ์นี้?")) return;

    let formData = new FormData();
    formData.append("id", id);

    fetch("php/equipment.php?action=delete_equipment", {
        method: "POST",
        body: formData
    })
        .then(res => res.json())
        .then(result => {
            alert(result.status);
            renderStockFromDB();
            loadEquipment();
        })
        .catch(err => console.error("delete_equipment error:", err));
}

/* ===== โหลดเมื่อเปิดหน้าเว็บ ===== */
loadEquipment();
renderStockFromDB();
