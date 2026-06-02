# PrepTrack Backend — Lambda Functions

## What each function does

### 1. preptrack-get-supplies
When a user opens the app, this function runs automatically.
It checks who is logged in, finds all the food items that belong
to their household, and sends that list to the dashboard to display.
No one can see another household's items — the login token ensures
each user only gets their own data.

### 2. preptrack-post-supplies
When a user fills out the add item form and clicks submit, this
function runs. It takes the item name, quantity, unit, and expiry
date the user entered, stamps it with today's date, generates a
unique ID for the item, and saves it to the database. The item
immediately becomes part of that household's supply list.

### 3. preptrack-put-supplies
When a user edits an existing item — maybe they bought more cans
of beans or corrected an expiry date — this function runs. It
finds that specific item in the database and updates only the
fields that changed. Everything else stays exactly the same.

### 4. preptrack-delete-supplies
When a user clicks delete on an item, this function runs. It
finds that exact item using the user ID and item ID together
and permanently removes it from the database. A user can only
delete items that belong to their own household.

### 5. sovereign-sentinel-profile
When a user opens the authenticated dashboard, this function handles
GET /profile by reading the household profile saved under that user's
Cognito sub. When the user saves Household Name, Household Size, or
Preparedness Goal, it handles PUT /profile and writes those fields to
DynamoDB using the Cognito sub as the userId partition key. The frontend
never sends or controls the userId, so the profile follows the same
logged-in user across devices.

### 6. preptrack-expiry-scanner
This function runs automatically every morning at 8AM. It scans
every item in the database and finds anything expiring within the
next 14 days. It then groups those items by household and sends
one email per household listing everything that is expiring soon.
If nothing is expiring that day, it stops quietly with no email sent.

## How they connect to the app

User opens app → get-supplies fetches their list → dashboard displays it
User adds item → post-supplies saves it → dashboard updates
User edits item → put-supplies updates it → dashboard reflects change
User deletes item → delete-supplies removes it → dashboard updates
User opens profile → GET /profile fetches their household details
User edits profile → PUT /profile saves household details by Cognito sub
Every morning 8AM → expiry-scanner checks everything → email sent if needed

## AWS Services used
- AWS Lambda — runs all 6 functions
- Amazon DynamoDB — stores all supply data
- Amazon SNS — sends the expiry email alerts
- Amazon EventBridge — schedules the morning scan
- Amazon API Gateway — connects the frontend to these functions
- Amazon Cognito — handles login and protects each household's data
