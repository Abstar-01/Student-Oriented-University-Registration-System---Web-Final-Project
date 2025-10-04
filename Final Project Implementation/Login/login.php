<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

// Include database connection
include '../DatabaseConnection.php';

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request method'
    ]);
    exit;
}

// Get POST data safely
$username = $_POST['username'] ?? '';
$password = $_POST['password'] ?? '';

if (empty($username) || empty($password)) {
    echo json_encode([
        'success' => false,
        'message' => 'Please provide username and password'
    ]);
    exit;
}

try {
    // Prepare stored procedure call for login
    $stmt = $conn->prepare("CALL LoginStats(?, ?)");
    if (!$stmt) {
        throw new Exception('Prepare failed: ' . $conn->error);
    }

    $stmt->bind_param("ss", $username, $password);

    if (!$stmt->execute()) {
        throw new Exception('Execute failed: ' . $stmt->error);
    }

    // Fetch result (requires mysqlnd)
    $result = $stmt->get_result();
    $row = $result ? $result->fetch_assoc() : null;

    $stmt->close();

    // Check login success
    if ($row && isset($row['Username']) && isset($row['status']) && $row['status'] === 'loggedin') {
        $_SESSION['username'] = $row['Username'];

        // 🔹 Get StudentID and Batch from Student table
        $query = "
            SELECT s.StudentID, s.Batch 
            FROM Student s
            INNER JOIN Login l ON s.StudentID = l.StudentID
            WHERE l.Username = ?
        ";
        $stmt2 = $conn->prepare($query);
        $stmt2->bind_param("s", $username);
        $stmt2->execute();
        $result2 = $stmt2->get_result();
        $studentRow = $result2->fetch_assoc();
        $stmt2->close();

        if ($studentRow) {
            $_SESSION['studentid'] = $studentRow['StudentID'];
            $_SESSION['batch'] = $studentRow['Batch'];
            
            // 🔹 CALCULATE AND STORE GPA IN SESSION (MOVED FROM ACADEMIE.PHP)
            $cgpa = null;
            $stmt3 = $conn->prepare("CALL CalculateGPA(?)");
            $stmt3->bind_param("s", $studentRow['StudentID']);
            $stmt3->execute();
            $result3 = $stmt3->get_result();
            if ($result3) {
                $gpaRow = $result3->fetch_assoc();
                $cgpa = round($gpaRow['CGPA'], 2); // round to 2 decimal places
                $_SESSION['gpa'] = $cgpa;
            }
            $stmt3->close();
        }

        // Return JSON for JavaScript
        echo json_encode([
            'success'   => true,
            'username'  => $row['Username'],
            'studentid' => $_SESSION['studentid'] ?? null,
            'batch'     => $_SESSION['batch'] ?? null,
            'gpa'       => $_SESSION['gpa'] ?? null,
            'password'  => $password // ⚠ only for testing — remove in production
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid credentials'
        ]);
    }
} catch (Throwable $e) {
    // Return server error in JSON
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}
?>