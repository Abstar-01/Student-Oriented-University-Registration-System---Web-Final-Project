<?php
$servername = "localhost";
$username   = "root";
$password   = "Batman123";  
$dbname     = "universitydatabse";

$conn = new mysqli($servername, $username, $password, $dbname, 3307);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>