<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
header("Content-Type: application/json");

$conn = new mysqli("localhost", "root", "", "sport_equipment_db");
if ($conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "DB connection failed"]);
    exit;
}

$action = $_GET['action'] ?? '';

/* ===== INSERT USER ===== */
if ($action === 'add_user') {

    if (!isset($_POST['username'])) {
        echo json_encode(["status" => "error", "message" => "No username"]);
        exit;
    }

    $username = $_POST['username'];

    $stmt = $conn->prepare("INSERT INTO users (username) VALUES (?)");
    $stmt->bind_param("s", $username);

    if ($stmt->execute()) {
        echo json_encode(["status" => "success"]);
    } else {
        echo json_encode(["status" => "error", "message" => $stmt->error]);
    }

    exit;
}

/* ===== GET USERS ===== */
if ($action === 'list_user') {

    $result = $conn->query("SELECT * FROM users ORDER BY id DESC");

    $users = [];
    while ($row = $result->fetch_assoc()) {
        $users[] = $row;
    }

    echo json_encode($users);
    exit;
}

/* ===== INVALID ACTION ===== */
echo json_encode(["status" => "error", "message" => "Invalid action"]);
exit;
?>
