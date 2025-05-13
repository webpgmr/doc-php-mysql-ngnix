<?php
header('Content-Type: text/csv');
header('Content-Disposition: attachment; filename="users_export_' . date('Ymd_His') . '.csv"');
require_once __DIR__ . '/db_config.php';

$mysqli = new mysqli($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME);
if ($mysqli->connect_errno) {
    echo "ID,vorname,Nachname,PLZ,ORT\n";
    echo "Error,Database connection failed,,,,\n";
    exit;
}
$mysqli->set_charset('utf8mb4');
$result = $mysqli->query('SELECT ID, vorname, Nachname, PLZ, ORT FROM users');
$out = fopen('php://output', 'w');
fputcsv($out, ['ID', 'vorname', 'Nachname', 'PLZ', 'ORT']);
if ($result) {
    while ($row = $result->fetch_assoc()) {
        fputcsv($out, $row);
    }
    $result->free();
}
fclose($out);
$mysqli->close();
