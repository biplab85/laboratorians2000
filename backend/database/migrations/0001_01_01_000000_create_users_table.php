<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('alumni_records', function (Blueprint $table) {
            $table->id();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('section'); // A, B, C, D
            $table->integer('roll_number');
            $table->string('profile_image_path')->nullable();
            $table->boolean('is_registered')->default(false);
            $table->timestamps();

            $table->unique(['section', 'roll_number']);
        });

        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->foreignId('alumni_record_id')->constrained('alumni_records')->onDelete('cascade');
            $table->string('email')->unique();
            $table->string('phone')->nullable();
            $table->string('password');
            $table->boolean('is_active')->default(true);
            $table->string('blood_group')->nullable();
            $table->text('current_address')->nullable();
            $table->string('current_city')->nullable();
            $table->string('current_country')->nullable();
            $table->string('occupation')->nullable();
            $table->string('company_name')->nullable();
            $table->string('designation')->nullable();
            $table->text('bio')->nullable();
            $table->string('facebook_url')->nullable();
            $table->string('linkedin_url')->nullable();
            $table->string('whatsapp_number')->nullable();
            $table->string('emergency_contact_name')->nullable();
            $table->string('emergency_contact_phone')->nullable();
            $table->string('emergency_contact_relation')->nullable();
            $table->string('profile_image')->nullable();
            $table->text('favorite_memory')->nullable();
            $table->string('favorite_teacher')->nullable();
            $table->string('favorite_hangout')->nullable();
            $table->text('business_services')->nullable();
            $table->boolean('has_business_services')->default(false);
            $table->timestamp('email_verified_at')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
        Schema::dropIfExists('alumni_records');
    }
};
