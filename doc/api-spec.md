
# 🌐 PrepTrack API Endpoint Specification

This document serves as the single source of truth for the PrepTrack backend application tier. Front-end developers must design all data-fetching hooks against these structural contracts.

---

## 🔐 Security & Access Control

*   **Mechanism**: Amazon API Gateway Cognito User Pool Authorizer.
*   **Location**: All inbound HTTP requests must carry a valid identity token inside the standard network transport layer.
*   **Header Format**: `Authorization: Bearer <COGNITO_ID_TOKEN>`
*   **Enforcement Policy**: Requests missing an authorization string, containing expired authorization blocks, or possessing altered payloads will be dropped at the gateway layer and return an HTTP `401 Unauthorized` status response code.

---

## 📂 Core Inventory Endpoints

### 1. Fetch Pantry Inventory
*   **Method**: `GET`
*   **Route**: `/supplies`
*   **Description**: Pulls all stored food and supply items belonging to the authenticated household user pool profile.
*   **Success Response (`200 OK`)**:
    ```json
    [
      {
        "id": "item-uuid-1111",
        "householdId": "user-uuid-9999",
        "itemName": "Canned Beans",
        "quantity": 5,
        "expiryDate": "2026-12-31"
      },
      {
        "id": "item-uuid-2222",
        "householdId": "user-uuid-9999",
        "itemName": "Bottled Water",
        "quantity": 12,
        "expiryDate": "2027-05-15"
      }
    ]
    ```

### 2. Add New Food Item
*   **Method**: `POST`
*   **Route**: `/supplies`
*   **Description**: Inserts a new tracked supply asset record into the cloud database storage layer.
*   **Request Body**:
    ```json
    {
      "itemName": "Powdered Milk",
      "quantity": 2,
      "expiryDate": "2026-08-24"
    }
    ```
*   **Success Response (`201 Created`)**:
    ```json
    {
      "message": "Item added successfully",
      "id": "item-uuid-3333"
    }
    ```

### 3. Update Existing Item
*   **Method**: `PUT`
*   **Route**: `/supplies/{id}`
*   **Description**: Modifies mutable values (quantity counts or expiration target dates) of a specific record in the persistence engine.
*   **Path Parameters**: 
    *   `id` (string, required): The unique string identifier of the target item.
*   **Request Body**:
    ```json
    {
      "quantity": 4,
      "expiryDate": "2026-09-15"
    }
    ```
*   **Success Response (`200 OK`)**:
    ```json
    {
      "message": "Item updated successfully"
    }
    ```

### 4. Remove Food Item
*   **Method**: `DELETE`
*   **Route**: `/supplies/{id}`
*   **Description**: Permanently drops an isolated single item record sequence from the active household partition pool.
*   **Path Parameters**:
    *   `id` (string, required): The unique string identifier of the target item.
*   **Success Response (`200 OK`)**:
    ```json
    {
      "message": "Item deleted successfully"
    }
    ```

---

## 👥 Household Profile Endpoints

### 1. Fetch Household Profile
*   **Method**: `GET`
*   **Route**: `/profile`
*   **Description**: Returns the household profile for the authenticated Cognito user. The backend scopes the lookup by the Cognito `sub` from the API Gateway authorizer claims.
*   **Success Response (`200 OK`)**:
    ```json
    {
      "userId": "cognito-sub-uuid",
      "householdName": "My Household",
      "householdSize": 4,
      "preparednessGoalDays": 30,
      "updatedAt": "2026-06-02T12:00:00.000Z"
    }
    ```
*   **No Profile Yet (`200 OK`)**:
    ```json
    null
    ```

### 2. Create or Update Household Profile
*   **Method**: `PUT`
*   **Route**: `/profile`
*   **Description**: Creates or replaces the authenticated user's household profile. The caller cannot provide `userId`; the backend always uses the Cognito `sub`.
*   **Request Body**:
    ```json
    {
      "householdName": "My Household",
      "householdSize": 4,
      "preparednessGoalDays": 30
    }
    ```
*   **Success Response (`200 OK`)**:
    ```json
    {
      "userId": "cognito-sub-uuid",
      "householdName": "My Household",
      "householdSize": 4,
      "preparednessGoalDays": 30,
      "updatedAt": "2026-06-02T12:00:00.000Z"
    }
    ```

---

## 🛑 Application Error Responses

### `400 Bad Request`
Triggered by missing required payload keys, improperly formatted parameters, or type errors inside structural requests.
```json
{
  "error": "Missing required field: itemName"
}
```

### `401 Unauthorized`
Triggered when the Cognito authorization verification engine fails due to token absence, expiration, or signing validation issues.
```json
{
  "message": "Unauthorized"
}
```

### `404 Not Found`
Triggered when transactional updates or deletions target item identifier vectors that do not exist within the primary system tracking partition.
```json
{
  "error": "Item not found"
}
```
