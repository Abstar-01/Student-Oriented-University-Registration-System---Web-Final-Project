<?php
// Set JSON header FIRST - before any output
header('Content-Type: application/json');

// Prevent any PHP errors from being displayed
ini_set('display_errors', 0);
error_reporting(0);

// Your existing include - don't change this
include '../database.php'; 

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

    // Your existing database logic here...
    $pre_check_sql = "SELECT COUNT(*) AS otp_count FROM OTP
                      WHERE OTPCode = '$otp_escaped' AND status = 'Not Expired'
                      AND EDT > NOW()";
    
    $pre_check_result = $conn->query($pre_check_sql);
    $pre_check_row = $pre_check_result->fetch_assoc();
    $valid_otp_count = $pre_check_row['otp_count'];

    if ($valid_otp_count == 0) {
        $response = ["status" => "failure", "message" => "OTP is invalid or expired"];
        echo json_encode($response);
        exit;
    }

    // Call stored procedure
    if (!$conn->query("CALL OTP_Verification('$otp_escaped', @otp_status)")) {
        throw new Exception("Procedure call failed");
    }

    // Clear result sets
    while ($conn->more_results()) {
        $conn->next_result();
        if ($result = $conn->store_result()) {
            $result->free();
        }
    }

    // Get the result from procedure
    $result = $conn->query("SELECT @otp_status AS otp_status");
    if ($result && $row = $result->fetch_assoc()) {
        $message = $row['otp_status'];
    }

    if ($valid_otp_count > 0) {
        $response = ["status" => "success", "message" => "Verified"];
    } else {
        $response = ["status" => "failure", "message" => "OTP is invalid or expired"];
    }

    $conn->close();

} catch (Exception $e) {
    $response = ["status" => "error", "message" => "Verification failed"];
}

// FINAL OUTPUT - ONLY JSON, NOTHING ELSE
echo json_encode($response);
exit;
?>