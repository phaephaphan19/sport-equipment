<?php
header("Content-Type: application/json; charset=utf-8");
$conn = mysqli_connect(
  "sql312.infinityfree.com",
  "if0_40940444",
  "2YAWxxe0SogaK",
  "if0_40940444_sport_equipment_db"
);

if ($conn->connect_error) {
    echo json_encode(["status"=>"error","message"=>"เชื่อมต่อฐานข้อมูลล้มเหลว"]);
    exit;
}

$action = $_GET['action'] ?? '';

/* ================= ยืมอุปกรณ์ ================= */
if ($action === 'borrow_equipment') {

    $user_id = intval($_POST['user_id']);
    $equipment_id = intval($_POST['equipment_id']);
    $qty = intval($_POST['qty']);

    $conn->begin_transaction();

    try {
        // 1. เช็ค stock
        $stmt = $conn->prepare("SELECT available FROM equipments WHERE id=? FOR UPDATE");
        if (!$stmt) throw new Exception($conn->error);

        $stmt->bind_param("i", $equipment_id);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();

        if (!$result || $result['available'] < $qty) {
            throw new Exception("อุปกรณ์ไม่พอ");
        }

        // 2. บันทึก borrows
        $stmt = $conn->prepare("
            INSERT INTO borrows (user_id, equipment_id, qty, borrow_date, status)
            VALUES (?,?,?,NOW(),'borrowed')
        ");
        if (!$stmt) throw new Exception($conn->error);

        $stmt->bind_param("iii", $user_id, $equipment_id, $qty);
        $stmt->execute();

        // 3. ตัด stock
        $stmt = $conn->prepare("
            UPDATE equipments
            SET available = available - ?
            WHERE id=?
        ");
        if (!$stmt) throw new Exception($conn->error);

        $stmt->bind_param("ii", $qty, $equipment_id);
        $stmt->execute();

        // 4. บันทึก history
        $conn->query("
            INSERT INTO borrow_history (user_id, equipment_id, qty, borrow_date, status)
            VALUES ($user_id, $equipment_id, $qty, NOW(), 'borrowed')
        ");

        $conn->commit();

        echo json_encode(["status"=>"success","message"=>"ยืมอุปกรณ์สำเร็จ"]);
        exit;

    } catch (Exception $e) {
        $conn->rollback();
        echo json_encode(["status"=>"error","message"=>$e->getMessage()]);
        exit;
    }
}

/* ================= รายการที่กำลังยืม ================= */
// if ($action === 'list_borrowed') {

//     $result = $conn->query("
//         SELECT b.id, u.username, e.equipment_code, e.equipment_name,
//                b.qty, b.borrow_date
//         FROM borrows b
//         JOIN users u ON b.user_id = u.id
//         JOIN equipments e ON b.equipment_id = e.id
//         WHERE b.status = 'borrowed'
//         ORDER BY b.borrow_date DESC
//     ");

//     $rows = [];
//     while ($row = $result->fetch_assoc()) {
//         $rows[] = $row;
//     }

//     echo json_encode($rows);
//     exit;
// }
if ($action === 'list_borrowed') {

    $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
    $limit = 8;
    $offset = ($page - 1) * $limit;

    $count = $conn->query("
        SELECT COUNT(*) AS total 
        FROM borrows 
        WHERE status = 'borrowed'
    ")->fetch_assoc()['total'];

    $totalPages = ceil($count / $limit);

    $result = $conn->query("
        SELECT b.id, u.username, e.equipment_code, e.equipment_name, b.qty, b.borrow_date
        FROM borrows b
        JOIN users u ON b.user_id = u.id
        JOIN equipments e ON b.equipment_id = e.id
        WHERE b.status = 'borrowed'
        ORDER BY b.borrow_date DESC
        LIMIT $limit OFFSET $offset
    ");

    $rows = [];
    while ($row = $result->fetch_assoc()) {
        $rows[] = $row;
    }

    echo json_encode([
        "data" => $rows,
        "totalPages" => $totalPages,
        "currentPage" => $page
    ]);
    exit;
}

/* ================= คืนอุปกรณ์ ================= */
if ($action === 'return_equipment') {

    $borrow_id = intval($_POST['borrow_id']);

    $conn->begin_transaction();

    try {
        // 1. ดึงข้อมูลการยืม
        $stmt = $conn->prepare("
            SELECT user_id, equipment_id, qty
            FROM borrows
            WHERE id=? AND status='borrowed'
            FOR UPDATE
        ");
        if (!$stmt) throw new Exception($conn->error);

        $stmt->bind_param("i", $borrow_id);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows == 0) {
            throw new Exception("ไม่พบรายการยืม");
        }

        $row = $result->fetch_assoc();
        $user_id = $row['user_id'];
        $equipment_id = $row['equipment_id'];
        $qty = $row['qty'];

        // 2. อัปเดต borrows
        $stmt = $conn->prepare("
            UPDATE borrows
            SET status='returned', return_date=NOW()
            WHERE id=?
        ");
        if (!$stmt) throw new Exception($conn->error);

        $stmt->bind_param("i", $borrow_id);
        $stmt->execute();

        // 3. เพิ่ม stock
        $stmt = $conn->prepare("
            UPDATE equipments
            SET available = available + ?
            WHERE id=?
        ");
        if (!$stmt) throw new Exception($conn->error);

        $stmt->bind_param("ii", $qty, $equipment_id);
        $stmt->execute();

        // 4. ปิด history record ล่าสุด
        $conn->query("
            UPDATE borrow_history
            SET status='returned', return_date=NOW()
            WHERE user_id=$user_id
              AND equipment_id=$equipment_id
              AND status='borrowed'
            ORDER BY borrow_date DESC
            LIMIT 1
        ");

        $conn->commit();

        echo json_encode(["status"=>"success","message"=>"คืนอุปกรณ์เรียบร้อยแล้ว"]);
        exit;

    } catch (Exception $e) {
        $conn->rollback();
        echo json_encode(["status"=>"error","message"=>$e->getMessage()]);
        exit;
    }
}

/* ================= รายการประวัติทั้งหมด ================= */
// if ($action === 'list_history') {

//     $result = $conn->query("
//         SELECT h.id, u.username, e.equipment_name,
//                h.qty, h.borrow_date, h.return_date, h.status
//         FROM borrow_history h
//         JOIN users u ON h.user_id = u.id
//         JOIN equipments e ON h.equipment_id = e.id
//         ORDER BY h.borrow_date DESC
//     ");

//     $rows = [];
//     while ($row = $result->fetch_assoc()) {
//         $rows[] = $row;
//     }

//     echo json_encode($rows);
//     exit;
// }
if ($action === 'list_history') {

    $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
    $page = max(1, $page);

    $limit = 10;
    $offset = ($page - 1) * $limit;

    $limit = (int)$limit;
    $offset = (int)$offset;

    $count = $conn->query("
    SELECT COUNT(*) AS total
    FROM borrow_history h
    JOIN users u ON h.user_id = u.id
    JOIN equipments e ON h.equipment_id = e.id
    ")->fetch_assoc()['total'];

    $totalPages = ceil($count / $limit);

    $result = $conn->query("
        SELECT h.id, u.username, e.equipment_code, e.equipment_name, h.qty,
               h.borrow_date, h.return_date, h.status
        FROM borrow_history h
        JOIN users u ON h.user_id = u.id
        JOIN equipments e ON h.equipment_id = e.id
        ORDER BY h.borrow_date DESC
        LIMIT $limit OFFSET $offset
    ");

    if (!$result) {
        echo json_encode([
            "status" => "error",
            "message" => $conn->error
        ]);
        exit;
    }

    $rows = [];
    while ($row = $result->fetch_assoc()) {
        $rows[] = $row;
    }

    echo json_encode([
        "data" => $rows,
        "totalPages" => $totalPages,
        "currentPage" => $page
    ]);
    exit;
}

if ($action === 'reset_history') {

    // ลบประวัติทั้งหมด
    $delete = $conn->query("DELETE FROM borrow_history");

    if ($delete) {
        echo json_encode([
            "status" => "success",
            "message" => "ลบประวัติการยืม–คืนทั้งหมดเรียบร้อยแล้ว"
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "ไม่สามารถลบประวัติได้"
        ]);
    }

    exit;
}

echo json_encode(["status"=>"error","message"=>"Invalid action"]);
exit;
