<?php
header('Content-Type: application/json');
ini_set('display_errors', 0);
error_reporting(0);

include '../DatabaseConnection.php';

$response = ["status" => "error", "message" => "Unknown error"];

try {
    $otp1 = $_POST['otp1'] ?? '';
    $otp2 = $_POST['otp2'] ?? '';
    $otp3 = $_POST['otp3'] ?? '';
    $otp4 = $_POST['otp4'] ?? '';
    $otp = $otp1 . $otp2 . $otp3 . $otp4;

    if (strlen($otp) !== 4 || !ctype_digit($otp)) {
        echo json_encode(["status" => "failure", "message" => "Invalid OTP format"]);
        exit;
    }

    $otp_escaped = $conn->real_escape_string($otp);

    // Check OTP validity
    $pre_check_sql = "
        SELECT COUNT(*) AS otp_count 
        FROM OTP 
        WHERE OTPCode = '$otp_escaped' 
          AND status = 'Not Expired'
          AND EDT > NOW()
    ";
    $pre_check_result = $conn->query($pre_check_sql);

    if (!$pre_check_result) {
        throw new Exception("OTP pre-check query failed: " . $conn->error);
    }

    $pre_check_row = $pre_check_result->fetch_assoc();
    $valid_otp_count = $pre_check_row['otp_count'] ?? 0;

    if ($valid_otp_count == 0) {
        echo json_encode(["status" => "failure", "message" => "OTP is invalid or expired"]);
        exit;
    }

    // Call stored procedure
    if (!$conn->query("CALL OTP_Verification('$otp_escaped', @otp_status)")) {
        throw new Exception("Stored procedure call failed: " . $conn->error);
    }

    // Clear results to avoid “commands out of sync” errors
    while ($conn->more_results() && $conn->next_result()) {
        if ($result = $conn->store_result()) {
            $result->free();
        }
    }

    // Get stored procedure result
    $result = $conn->query("SELECT @otp_status AS otp_status");
    if (!$result) {
        throw new Exception("Failed to fetch procedure output: " . $conn->error);
    }

    $row = $result->fetch_assoc();
    $message = $row['otp_status'] ?? "Unknown";

    if ($message === "Verified") {
        $response = ["status" => "success", "message" => "OTP verified successfully"];
    } else {
        $response = ["status" => "failure", "message" => "OTP verification failed"];
    }

    $conn->close();
} catch (Exception $e) {
    $response = [
        "status" => "error",
        "message" => $e->getMessage()
    ];
}

echo json_encode($response);
exit;
?>
