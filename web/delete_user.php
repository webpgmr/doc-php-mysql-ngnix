<?php
header('Content-Type: application/json');
require_once __DIR__ . '/db_config.php';
$mysqli = new mysqli($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME);
if ($mysqli->connect_errno) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed: ' . $mysqli->connect_error]);
    exit;
}
$mysqli->set_charset('utf8mb4');

$data = json_decode(file_get_contents('php://input'), true);
if (!isset($data['ID'])) {
    echo json_encode(['success' => false, 'message' => 'Missing ID.']);
    exit;
}
$stmt = $mysqli->prepare('DELETE FROM users WHERE ID=?');
$stmt->bind_param('i', $data['ID']);
if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Delete failed.']);
}
$stmt->close();
$mysqli->close();
