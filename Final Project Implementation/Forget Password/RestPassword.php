<?php
session_start();
header('Content-Type: application/json');
include 'DatabaseConnection.php';

// Get posted values
$password = $_POST['password'] ?? '';
$email = $_SESSION['RestUserEmail'] ?? ''; // Email saved in session earlier

if (empty($password) || empty($email)) {
    echo json_encode(["status" => "error", "message" => "Password or email missing"]);
    exit;
}

// Call stored procedure
$sql = "CALL Update_password(?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ss", $email, $password);

if ($stmt->execute()) {
    // Store result set
    $stmt->store_result();

    // Bind result column (Message returned from procedure)
    $stmt->bind_result($message);

    if ($stmt->fetch()) {
        echo json_encode(["status" => "success", "message" => $message]);
    } else {
        echo json_encode(["status" => "error", "message" => "No response from procedure"]);
    }

    // Important: free results to avoid "Commands out of sync" error
    $stmt->free_result();
    while ($conn->more_results() && $conn->next_result()) {
        if ($extraResult = $conn->store_result()) {
            $extraResult->free();
        }
    }
} else {
    echo json_encode(["status" => "error", "message" => "Failed to execute procedure"]);
}

$stmt->close();
$conn->close();
?>
