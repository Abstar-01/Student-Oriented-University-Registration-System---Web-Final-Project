<?php
session_start();
header('Content-Type: application/json');
include '../DatabaseConnection.php';

// Retrieve email from session
$email = $_SESSION['RestUserEmail'] ?? '';

$password = $_POST['password'] ?? '';
$confirm_password = $_POST['confirm_password'] ?? '';

// Validation
if (empty($email)) {
    echo json_encode(["status" => "error", "message" => "Session expired or email missing. Please restart the reset process."]);
    exit;
}

if (empty($password) || empty($confirm_password)) {
    echo json_encode(["status" => "error", "message" => "Please enter both password fields."]);
    exit;
}

if ($password !== $confirm_password) {
    echo json_encode(["status" => "error", "message" => "Passwords do not match."]);
    exit;
}

if (!preg_match('/[A-Za-z]/', $password) || !preg_match('/[0-9]/', $password)) {
    echo json_encode(["status" => "error", "message" => "Password must contain both letters and numbers."]);
    exit;
}

if (strlen($password) < 6) {
    echo json_encode(["status" => "error", "message" => "Password must be at least 6 characters long."]);
    exit;
}

try {
    // Prepare the stored procedure
    $stmt = $conn->prepare("CALL Update_password(?, ?)");
    $stmt->bind_param("ss", $email, $password);

    if ($stmt->execute()) {
        $result = $stmt->get_result();

        if ($row = $result->fetch_assoc()) {
            $message = $row['Message'] ?? 'No response from procedure';
            if (strpos(strtolower($message), 'updated') !== false) {
                echo json_encode(["status" => "success", "message" => $message]);
            } else {
                echo json_encode(["status" => "failure", "message" => $message]);
            }
        } else {
            echo json_encode(["status" => "error", "message" => "Unexpected procedure output."]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to execute stored procedure."]);
    }

    $stmt->close();
    $conn->close();

} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Server error: " . $e->getMessage()]);
}
?>
