<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
ob_start(); // buffer output so nothing accidentally breaks JSON
session_start();

$HOSTNAME = 'localhost';
$USERNAME = 'root';
$PASSWORD = '';
$DATABASE = 'signup_forms_dx';

$conn = mysqli_connect($HOSTNAME, $USERNAME, $PASSWORD, $DATABASE);
if (!$conn) {
    header('Content-Type: application/json');
    echo json_encode(["status" => "error", "message" => "DB connection failed: " . mysqli_connect_error()]);
    exit;
}

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
require __DIR__ . '/vendor/autoload.php'; // Path to PHPMailer

if (!isset($_POST['action'])) {
    header('Content-Type: application/json');
    echo json_encode(["status" => "error", "message" => "No action received"]);
    exit;
}

$action = $_POST['action'];

// contact messages
if ($action === 'contact') {
    header('Content-Type: application/json');

    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $subject = trim($_POST['subject'] ?? '');
    $message = trim($_POST['message'] ?? '');

    if ($name === '' || $email === '' || $subject === '' || $message === '') {
        echo json_encode(["status" => "error", "message" => "All fields are required"]);
        exit;
    }

    $stmt = $conn->prepare("INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssss", $name, $email, $subject, $message);

    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Thank you for contacting us! We'll get back to you soon."]);
    } else {
        echo json_encode(["status" => "error", "message" => "Database error"]);
    }

    $stmt->close();
    exit;
}

// signup
elseif ($action === 'signup') {
    header('Content-Type: application/json');

    $name = $_POST['fullname'] ?? '';
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';

    if (!$name || !$email || !$password) {
        echo json_encode(["status" => "error", "message" => "All fields are required"]);
        exit;
    }

    $passwordHash = password_hash($password, PASSWORD_DEFAULT);

    // Check if email exists using prepared statement
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        echo json_encode(["status" => "error", "message" => "You already signed up with this email. Please login instead."]);
        exit;
    }
    $stmt->close();

    // Insert user using prepared statement
    $stmt = $conn->prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $name, $email, $passwordHash);

    if ($stmt->execute()) {
        
        $mail = new PHPMailer(true);
        try {
            $mail->isSMTP();
            $mail->Host       = 'smtp.gmail.com';
            $mail->SMTPAuth   = true;
            $mail->Username   = 'add your email';
            $mail->Password   = 'add yours';
            $mail->SMTPSecure = 'tls';
            $mail->Port       = 587;

            $mail->setFrom('add your email', 'DisasterX');
            $mail->addAddress($email, $name);

            $mail->isHTML(true);
            $mail->Subject = 'Welcome to DisasterX!';
            $mail->Body = "Hello {$name},<br><br>Thank you for signing up at <b>DisasterX</b>!<br>We’re excited to have you onboard.";

            $mail->send();
        } catch (Exception $e) {
            // email failure should not block signup
        }

        echo json_encode(["status" => "success", "message" => "Signup successful! Please login."]);
    } else {
        echo json_encode(["status" => "error", "message" => "Signup failed. Please try again."]);
    }
    $stmt->close();
    exit;
}

// login
elseif ($action === 'login') {
    header('Content-Type: application/json');

    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';

    if (!$email || !$password) {
        echo json_encode(["status" => "error", "message" => "All fields are required"]);
        exit;
    }

    $stmt = $conn->prepare("SELECT id, name, password FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows === 1) {
        $stmt->bind_result($id, $name, $hashedPassword);
        $stmt->fetch();

       if (password_verify($password, $hashedPassword)) {

    $_SESSION['user_id']    = $id;
    $_SESSION['user_name']  = $name;
    $_SESSION['user_email'] = $email;

    echo json_encode([
        "status" => "success",
        "message" => "Login successful. Welcome $name"
    ]);
} else {
            echo json_encode(["status" => "error", "message" => "Invalid password"]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "User not found"]);
    }
    $stmt->close();
    exit;
}

// forget password
elseif ($action === 'forgot') {
    header('Content-Type: application/json');

    $email = $_POST['email'] ?? '';

    if (!$email) {
        echo json_encode(["status" => "error", "message" => "Email is required"]);
        exit;
    }

    // Check if user exists
    $stmt = $conn->prepare("SELECT id, name FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows === 1) {
        $stmt->bind_result($id, $name);
        $stmt->fetch();

        $tempPassword = substr(str_shuffle("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"), 0, 8);
        $hashedPassword = password_hash($tempPassword, PASSWORD_DEFAULT);

        $updateStmt = $conn->prepare("UPDATE users SET password = ? WHERE email = ?");
        $updateStmt->bind_param("ss", $hashedPassword, $email);
        $updateStmt->execute();
        $updateStmt->close();

        $mail = new PHPMailer(true);
        try {
            $mail->isSMTP();
            $mail->Host       = 'smtp.gmail.com';
            $mail->SMTPAuth   = true;
            $mail->Username   = 'add your email';
            $mail->Password   = 'add yours';
            $mail->SMTPSecure = 'tls';
            $mail->Port       = 587;

            $mail->setFrom('add your email', 'DisasterX');
            $mail->addAddress($email, $name);

            $mail->isHTML(true);
            $mail->Subject = 'DisasterX Password Reset';
            $mail->Body = "Hello {$name},<br><br>Your temporary password is: <b>$tempPassword</b><br>Please login and change it immediately.";

            $mail->send();
            echo json_encode(["status" => "success", "message" => "Password reset email sent! Check your inbox."]);
        } catch (Exception $e) {
            echo json_encode(["status" => "error", "message" => "Failed to send email: {$mail->ErrorInfo}"]);
        }

    } else {
        echo json_encode(["status" => "error", "message" => "User not found with this email."]);
    }

    $stmt->close();
    exit;
}

// download
elseif ($action === 'download') {
    header('Content-Type: application/json');

    if (!isset($_SESSION['user_email'])) {
        echo json_encode([
            "status" => "error",
            "message" => "You must be logged in to download."
        ]);
        exit;
    }

    $name    = $_SESSION['user_name'];
    $email   = $_SESSION['user_email'];
    $version = trim($_POST['version'] ?? '');

    if ($version === '') {
        echo json_encode([
            "status" => "error",
            "message" => "No version selected"
        ]);
        exit;
    }

    $stmt = $conn->prepare(
        "INSERT INTO downloads (user_name, user_email, version)
         VALUES (?, ?, ?)"
    );

    if (!$stmt) {
        echo json_encode([
            "status" => "error",
            "message" => $conn->error
        ]);
        exit;
    }

    $stmt->bind_param("sss", $name, $email, $version);
    $stmt->execute();
    $stmt->close();

    echo json_encode([
        "status" => "success",
        "message" => "Download choice saved"
    ]);
    exit;
}


mysqli_close($conn);
?>
