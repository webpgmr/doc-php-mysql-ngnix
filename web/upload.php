<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
        $fileTmpPath = $_FILES['file']['tmp_name'];
        $fileName = $_FILES['file']['name'];
        $fileSize = $_FILES['file']['size'];
        $fileType = $_FILES['file']['type'];
        $fileNameCmps = explode(".", $fileName);
        $fileExtension = strtolower(end($fileNameCmps));

        if ($fileExtension === 'csv') {
            $uploadFileDir = __DIR__ . '/uploads/';
            if (!is_dir($uploadFileDir)) {
                mkdir($uploadFileDir, 0777, true);
            }
            $dest_path = $uploadFileDir . $fileName;
            if(move_uploaded_file($fileTmpPath, $dest_path)) {
                // Connect to MySQL using db_config.php
                require_once __DIR__ . '/db_config.php';
                $mysqli = new mysqli($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME);
                if ($mysqli->connect_errno) {
                    echo json_encode(['success' => false, 'message' => 'Database connection failed: ' . $mysqli->connect_error]);
                    exit;
                }
                // Set charset
                $mysqli->set_charset('utf8mb4');
                // Open the CSV file
                if (($handle = fopen($dest_path, 'r')) !== false) {
                    $rowCount = 0;
                    while (($data = fgetcsv($handle, 1000, ',')) !== false) {
                        // Skip header row if present (assume first row is header if it contains 'ID')
                        if ($rowCount === 0 && (stripos($data[0], 'id') !== false)) {
                            $rowCount++;
                            continue;
                        }
                        // Prepare and execute insert
                        $stmt = $mysqli->prepare('INSERT INTO users (ID, vorname, Nachname, PLZ, ORT) VALUES (?, ?, ?, ?, ?)');
                        if ($stmt) {
                            $stmt->bind_param('issss', $data[0], $data[1], $data[2], $data[3], $data[4]);
                            $stmt->execute();
                            $stmt->close();
                        }
                        $rowCount++;
                    }
                    fclose($handle);
                    $mysqli->close();
                    echo json_encode(['success' => true, 'message' => 'File uploaded and data imported to database. Rows inserted: ' . ($rowCount-1)]);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Failed to open uploaded CSV file.']);
                }
            } else {
                echo json_encode(['success' => false, 'message' => 'Error moving the uploaded file.']);
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'Only CSV files are allowed.']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'No file uploaded or upload error.']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request.']);
}
