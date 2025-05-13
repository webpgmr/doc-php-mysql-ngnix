<?php
header('Content-Type: application/json');
require_once __DIR__ . '/db_config.php';
$mysqli = new mysqli($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME);
if ($mysqli->connect_errno) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed: ' . $mysqli->connect_error]);
    exit;
}
$mysqli->set_charset('utf8mb4');

// Sorting
$allowed = ['ID', 'vorname', 'Nachname', 'PLZ', 'ORT'];
$sort = isset($_GET['sort']) && in_array($_GET['sort'], $allowed) ? $_GET['sort'] : 'ID';
$order = (isset($_GET['order']) && strtolower($_GET['order']) === 'desc') ? 'DESC' : 'ASC';

$result = $mysqli->query("SELECT ID, vorname, Nachname, PLZ, ORT FROM users ORDER BY $sort $order");
$users = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $users[] = $row;
    }
    $result->free();
}
$mysqli->close();
echo json_encode(['success' => true, 'data' => $users]);
