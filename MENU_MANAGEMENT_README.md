# Menu Management System

## Overview
This feature provides a comprehensive menu management system for restaurant dashboard users. It allows restaurants to create, edit, delete menus and manage the items within each menu.

## Features

### 1. Menu Management
- **Create Menus**: Add new menus with name, price, image, and availability status
- **Edit Menus**: Modify existing menu details including updating images
- **Delete Menus**: Remove menus with confirmation dialogs
- **Search Menus**: Search through menus by name
- **Menu Status**: Toggle menu availability

### 2. Menu Items Management
- **View Menu Items**: See all items currently in a menu
- **Add Items to Menu**: Select from available restaurant items to add to menus
- **Remove Items from Menu**: Remove items from specific menus
- **Search Available Items**: Search through restaurant items when adding to menus
- **Real-time Updates**: Immediate UI updates when adding/removing items

## File Structure

### Components
- `MenuPage.jsx` - Main menu management page
- `MenuCard.jsx` - Individual menu display component
- `AddMenuModal.jsx` - Modal for creating new menus
- `EditMenuModal.jsx` - Modal for editing existing menus
- `MenuItemsModal.jsx` - Modal for managing items within a menu

### Services
- `menuService.js` - API service for menu-related operations

## Navigation
- Access via restaurant dashboard sidebar: "Gestion Menu"
- URL: `/restaurant/menu`
- Also accessible via quick actions on restaurant homepage

## API Endpoints Used
- `GET /restaurants/menu/getRestaurentMenu/:id` - Get all menus for a restaurant
- `POST /restaurants/menu/create` - Create new menu
- `PUT /restaurants/menu/update/:id` - Update existing menu
- `DELETE /restaurants/menu/delete/:id` - Delete menu
- `GET /restaurants/menuItem/getItemMenu/:menuId` - Get items in a menu
- `POST /restaurants/menuItem/add` - Add item to menu
- `DELETE /restaurants/menuItem/delete/:menuId/:itemId` - Remove item from menu
- `GET /restaurants/item/getRestaurentItem/:restaurantId` - Get all restaurant items

## UI/UX Features
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Loading States**: Proper loading indicators during API calls
- **Error Handling**: User-friendly error messages
- **Confirmation Dialogs**: Safety confirmations for destructive actions
- **Image Upload**: Drag-and-drop image upload with preview
- **Search & Filter**: Real-time search functionality
- **Modern Design**: Consistent with the overall application design

## Usage Instructions

### Creating a Menu
1. Click "Ajouter un Menu" button
2. Fill in menu name and price
3. Upload an image for the menu
4. Set availability status
5. Click "Créer le Menu"

### Managing Menu Items
1. Click "Voir Articles" on any menu card
2. Click "Ajouter" to add new items to the menu
3. Search through available items
4. Add items by clicking the "+" button
5. Remove items by clicking the trash icon

### Editing a Menu
1. Click the edit icon on any menu card
2. Modify the desired fields
3. Optionally change the menu image
4. Click "Modifier le Menu"

### Deleting a Menu
1. Click the three dots menu on any menu card
2. Select "Supprimer"
3. Confirm the deletion in the dialog

## Technical Notes
- Images are handled with multipart/form-data uploads
- Real-time UI updates without page refresh
- Optimistic UI updates for better user experience
- Error boundaries for graceful error handling
- Accessible design with proper ARIA labels and keyboard navigation
