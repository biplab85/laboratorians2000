<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notification_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->boolean('email_on_login')->default(true);
            $table->boolean('email_on_registration')->default(true);
            $table->boolean('email_on_urgent')->default(true);
            $table->boolean('inapp_on_login')->default(true);
            $table->boolean('inapp_on_registration')->default(true);
            $table->boolean('inapp_on_urgent')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_settings');
    }
};
