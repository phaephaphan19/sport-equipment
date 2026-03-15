<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
header("Content-Type: application/json");

$conn = mysqli_connect(
  "sql312.infinityfree.com",
  "if0_40940444",
  "2YAWxxe0SogaK",
  "if0_40940444_sport_equipment_db"
);

if ($conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "DB connection failed"]);
    exit;
}

$action = $_GET['action'] ?? '';

/* ===== INSERT EQUIPMENT ===== */
if ($action === 'add_equipment') {
	
    $equipment_code = $_POST['equipment_code'] ?? '';
    $equipment_name = $_POST['equipment_name'] ?? '';
    $total = $_POST['total'] ?? 0;

    $stmt = $conn->prepare(
        "INSERT INTO equipments (equipment_code, equipment_name, total, available, status)
         VALUES (?, ?, ?, ?, 'พร้อมใช้งาน')"
    );
    $stmt->bind_param("ssii", $equipment_code, $equipment_name, $total, $total);

    if ($stmt->execute()) {
        echo json_encode(["status" => "success"]);
    } else {
        echo json_encode(["status" => "error", "message" => $stmt->error]);
    }
    exit;
}

/* ===== GET EQUIPMENT ===== */
if ($action === 'list_equipment') {

    $result = $conn->query("SELECT * FROM equipments ORDER BY id DESC");

    $equipment = [];
    while ($row = $result->fetch_assoc()) {
        $equipment[] = $row;
    }

    echo json_encode($equipment);
    exit;
}

/* ===== DELETE EQUIPMENT ===== */
if ($action === 'delete_equipment') {

    $id = $_POST['id'] ?? 0;

    $stmt = $conn->prepare("DELETE FROM equipments WHERE id = ?");
    $stmt->bind_param("i", $id);

    if ($stmt->execute()) {
        echo json_encode(["status" => "success"]);
    } else {
        echo json_encode(["status" => "error"]);
    }
    exit;
}

/* ===== INVALID ACTION ===== */
echo json_encode(["status" => "error", "message" => "Invalid action"]);
exit;
?>
