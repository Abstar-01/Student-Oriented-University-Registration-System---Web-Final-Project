<?php 
session_start();
header('Content-Type: application/json');
include '../DatabaseConnection.php';

// Retrieve email from session
$email = $_SESSION['RestUserEmail'] ?? '';

// Validation
if (empty($email)) {
    echo json_encode(["status" => "error", "message" => "Session expired or email missing. Please restart the reset process."]);
    exit;
}

try {
    $stmtOTP = $conn->prepare("CALL Generate_OTP()");
    if (!$stmtOTP) throw new Exception("Prepare failed for OTP: " . $conn->error);
    $stmtOTP->execute();

    // Get the generated OTP
    $resultOTP = $stmtOTP->get_result();
    if ($resultOTP && $otpRow = $resultOTP->fetch_assoc()) {
        $otp = $otpRow['OTP'];
        $resultOTP->free();
        $stmtOTP->close();

        // Store OTP in session for verification
        $_SESSION['otp'] = $otp;

        // Step 3: Send OTP via email
        $apiKey = "FBD19C9779307D921121CFF4BAA00BB09DA7116F3282650D96472825535D6F2BDF77A894477B58BC9F6EE4D76D2416BB";

        $post = [
            'apikey'     => $apiKey,
            'from'       => 'abgirma03@gmail.com',
            'fromName'   => 'Hicole Verification',
            'to'         => $email,
            'subject'    => 'Your New OTP Code',
            'bodyHtml'   => "<h2>Email Verification</h2><p>Your new OTP code is: <strong>$otp</strong></p>",
            'bodyText'   => "Your new OTP code is: $otp",
            'isTransactional' => true
        ];

        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => "https://api.elasticemail.com/v2/email/send",
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $post,
            CURLOPT_RETURNTRANSFER => true
        ]);

        $emailResponse = curl_exec($ch);
        $curlError = curl_error($ch);
        curl_close($ch);

        echo json_encode(["status" => "success", "message" => "New OTP has been sent to your email."]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to generate OTP."]);
    }
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Server error: " . $e->getMessage()]);
}
?>