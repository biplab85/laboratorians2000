<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\GalleryController;
use App\Http\Controllers\Api\MemberController;
use App\Http\Controllers\Api\ProfessionalNoticeController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\UrgentRequestController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/verify-alumni', [AuthController::class, 'verifyAlumni']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Dashboard
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('/dashboard/recent-alumni', [DashboardController::class, 'recentAlumni']);
    Route::get('/dashboard/recent-urgent', [DashboardController::class, 'recentUrgentRequests']);

    // Urgent Requests
    Route::get('/urgent-requests', [UrgentRequestController::class, 'index']);
    Route::get('/urgent-requests/{id}', [UrgentRequestController::class, 'show']);
    Route::post('/urgent-requests', [UrgentRequestController::class, 'store']);

    // Professional Notices
    Route::get('/professional-notices', [ProfessionalNoticeController::class, 'index']);
    Route::post('/professional-notices', [ProfessionalNoticeController::class, 'store']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead']);
    Route::post('/notifications/batch-read', [NotificationController::class, 'batchRead']);
    Route::post('/notifications/batch-unread', [NotificationController::class, 'batchUnread']);
    Route::post('/notifications/batch-delete', [NotificationController::class, 'batchDelete']);
    Route::get('/notifications/trash', [NotificationController::class, 'trash']);
    Route::post('/notifications/restore', [NotificationController::class, 'restore']);
    Route::get('/notifications/{id}', [NotificationController::class, 'show']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);

    // Members
    Route::get('/members', [MemberController::class, 'index']);
    Route::get('/members/{id}', [MemberController::class, 'show']);
    Route::put('/profile', [MemberController::class, 'updateProfile']);
    Route::post('/profile/image', [MemberController::class, 'updateProfileImage']);
    Route::delete('/profile/image', [MemberController::class, 'deleteProfileImage']);
    Route::post('/profile/banner', [MemberController::class, 'updateBanner']);
    Route::delete('/profile/banner', [MemberController::class, 'deleteBanner']);
    Route::put('/password', [MemberController::class, 'updatePassword']);

    // Gallery
    Route::get('/gallery', [GalleryController::class, 'index']);
    Route::post('/gallery', [GalleryController::class, 'store']);
    Route::put('/gallery/reorder', [GalleryController::class, 'reorder']);
    Route::put('/gallery/{id}', [GalleryController::class, 'update']);
    Route::post('/gallery/{id}/replace', [GalleryController::class, 'replace']);
    Route::delete('/gallery/{id}', [GalleryController::class, 'destroy']);
});
