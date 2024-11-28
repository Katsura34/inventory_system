<?php
// Database connection
$host = 'localhost';
$dbname = 'items_database';
$user = 'root';
$pass = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Database connection failed: " . $e->getMessage());
}

// Handle actions
$action = $_GET['action'] ?? '';

if ($action === 'fetch') {
    $search = $_GET['search'] ?? '';
    $page = (int)($_GET['page'] ?? 1);
    $limit = 10;
    $offset = ($page - 1) * $limit;

    $query = "SELECT * FROM items WHERE name LIKE :search LIMIT :offset, :limit";
    $stmt = $pdo->prepare($query);
    $stmt->bindValue(':search', "%$search%", PDO::PARAM_STR);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->execute();

    $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $countQuery = "SELECT COUNT(*) AS total FROM items WHERE name LIKE :search";
    $countStmt = $pdo->prepare($countQuery);
    $countStmt->bindValue(':search', "%$search%", PDO::PARAM_STR);
    $countStmt->execute();
    $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];

    echo json_encode(['items' => $items, 'total' => $total]);
} elseif ($action === 'create') {
    $name = $_POST['name'] ?? '';
    $quantity = (int)($_POST['quantity'] ?? 0);
    $price = (float)($_POST['price'] ?? 0.0);
    $image = $_POST['image'] ?? '';

    $query = "INSERT INTO items (name, quantity, price, image) VALUES (:name, :quantity, :price, :image)";
    $stmt = $pdo->prepare($query);
    $stmt->execute(['name' => $name, 'quantity' => $quantity, 'price' => $price, 'image' => $image]);

    echo json_encode(['success' => true]);
} elseif ($action === 'delete') {
    $id = (int)($_GET['id'] ?? 0);

    $query = "DELETE FROM items WHERE id = :id";
    $stmt = $pdo->prepare($query);
    $stmt->execute(['id' => $id]);

    echo json_encode(['success' => true]);
}
?>
