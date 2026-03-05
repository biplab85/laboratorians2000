<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('school_nick_name')->nullable()->after('profile_image');
            $table->string('best_friend')->nullable()->after('school_nick_name');
            $table->string('school_house')->nullable()->after('best_friend');
            $table->string('home_district')->nullable()->after('school_house');
            $table->string('academic_qualification')->nullable()->after('home_district');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['school_nick_name', 'best_friend', 'school_house', 'home_district', 'academic_qualification']);
        });
    }
};
