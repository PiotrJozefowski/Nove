<?php
// Nove — obsługa formularza kontaktowego (cyber-folks / PHP).
// Zastępuje dawny endpoint POST /kontakt z aplikacji node.
$recipient = 'biuro@nove-uslugi-budowlane.pl';

header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['success' => false, 'message' => 'Method not allowed']);
  exit;
}

// Formularz wysyła JSON (fetch). Fallback na zwykły POST.
$data = json_decode(file_get_contents('php://input'), true);
if (!is_array($data)) { $data = $_POST; }

$name    = trim(strip_tags($data['name'] ?? ''));
$email   = filter_var($data['email'] ?? '', FILTER_SANITIZE_EMAIL);
$phone   = trim(strip_tags($data['phone'] ?? ''));
$type    = trim(strip_tags($data['type'] ?? ''));
$message = trim(strip_tags($data['message'] ?? ''));

if ($name === '' || $message === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
  http_response_code(400);
  echo json_encode(['success' => false, 'message' => 'Uzupełnij wymagane pola.']);
  exit;
}

$subjectText = 'Nowe zapytanie - ' . ($type !== '' ? $type : 'kontakt');
$subject = '=?UTF-8?B?' . base64_encode($subjectText) . '?=';

$body  = "Imię i nazwisko: $name\n";
$body .= "E-mail: $email\n";
$body .= "Telefon: " . ($phone !== '' ? $phone : 'nie podano') . "\n";
$body .= "Rodzaj usługi: " . ($type !== '' ? $type : 'nie wybrano') . "\n\n";
$body .= "Wiadomość:\n$message\n";

$headers  = "From: formularz@" . ($_SERVER['HTTP_HOST'] ?? 'localhost') . "\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

if (mail($recipient, $subject, $body, $headers)) {
  echo json_encode(['success' => true, 'message' => 'Wiadomość została wysłana.']);
} else {
  http_response_code(500);
  echo json_encode(['success' => false, 'message' => 'Nie udało się wysłać wiadomości.']);
}
