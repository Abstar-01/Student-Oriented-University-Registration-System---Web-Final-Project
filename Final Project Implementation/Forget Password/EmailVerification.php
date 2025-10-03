<?php
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);
ini_set('log_errors', 1);
ini_set('error_log', 'php-error.log');

// Set response type to JSON
header('Content-Type: application/json');

$response = [];

try {
    include '../DatabaseConnection.php';  // adjust path if needed

    // Get email from POST
    $email = $_POST['email'] ?? '';
    if (!$email) {
        throw new Exception("Email is required");
    }

    // Step 1: Verify email
    $sql = "CALL VerifyEmail(?)";
    $stmt = $conn->prepare($sql);
    if (!$stmt) throw new Exception("Prepare failed: " . $conn->error);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result && $row = $result->fetch_assoc()) {
        $status = $row['status'] ?? 'error';
        $result->free();
        $stmt->close();

        if ($status === 'success') {

            // Step 2: Call Generate_OTP stored procedure
            $stmtOTP = $conn->prepare("CALL Generate_OTP()");
            if (!$stmtOTP) throw new Exception("Prepare failed for OTP: " . $conn->error);
            $stmtOTP->execute();

            // Get the generated OTP
            $resultOTP = $stmtOTP->get_result();
            if ($resultOTP && $otpRow = $resultOTP->fetch_assoc()) {
                $otp = $otpRow['OTP']; // ✅ store OTP in variable
                $resultOTP->free();
                $stmtOTP->close();

                // Step 3: Send OTP via email
                $apiKey = "FBD19C9779307D921121CFF4BAA00BB09DA7116F3282650D96472825535D6F2BDF77A894477B58BC9F6EE4D76D2416BB";

                $post = [
                    'apikey'     => $apiKey,
                    'from'       => 'abgirma03@gmail.com',
                    'fromName'   => 'Hicole Verification',
                    'to'         => $email,
                    'subject'    => 'Your OTP Code',
                    'bodyHtml'   => "<h2>Email Verification</h2><p>Your OTP code is: <strong>$otp</strong></p>",
                    'bodyText'   => "Your OTP code is: $otp",
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

                if ($emailResponse) {
                    $_SESSION['RestUserEmail'] = $email;
                    $response['status'] = 'success';
                    $response['message'] = 'OTP generated and sent successfully';
                    $response['otp'] = $otp; // ⚠️ For testing only — remove in production
                } else {
                    throw new Exception("Failed to send OTP: $curlError");
                }

            } else {
                throw new Exception("Failed to generate OTP");
            }

        } else {
            throw new Exception("Email not verified");
        }

    } else {
        throw new Exception("No result returned from VerifyEmail procedure");
    }

    $conn->close();

} catch (Exception $e) {
    $response['status'] = 'error';
    $response['message'] = $e->getMessage();
}

echo json_encode($response);
