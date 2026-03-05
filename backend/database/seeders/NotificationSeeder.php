<?php

namespace Database\Seeders;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Database\Seeder;

class NotificationSeeder extends Seeder
{
    public function run(): void
    {
        $templates = [
            [
                'type' => 'urgent',
                'title' => 'O+ Blood Needed Urgently',
                'body' => 'A fellow alumnus requires O+ blood at Dhaka Medical College Hospital. If you or anyone you know can help, please reach out immediately. The patient is in critical condition and needs at least 3 bags of blood by tomorrow morning.',
            ],
            [
                'type' => 'urgent',
                'title' => 'Emergency Medical Fund for Classmate',
                'body' => 'Our classmate needs urgent financial support for a medical emergency at Square Hospital, Dhaka. The estimated cost is BDT 5,00,000. Any contribution, big or small, will make a difference. Please contact the organizing committee for bank details.',
            ],
            [
                'type' => 'registration',
                'title' => 'Nusrat Jahan joined the community',
                'body' => 'A new member from Section A, Batch 2000 has registered on the platform. Welcome Nusrat Jahan to our alumni community! Feel free to connect and catch up on old memories.',
            ],
            [
                'type' => 'registration',
                'title' => 'Tanvir Rahman joined the community',
                'body' => 'A new member from Section B, Batch 2000 has registered on the platform. Tanvir is currently working as a Senior Software Engineer at a leading tech company. Connect with him to expand your professional network.',
            ],
            [
                'type' => 'login',
                'title' => 'New login from a new device',
                'body' => 'We detected a new login to your account from a Windows device in Dhaka, Bangladesh. If this was you, no action is needed. If you did not recognize this login, please change your password immediately and enable two-factor authentication.',
            ],
            [
                'type' => 'urgent',
                'title' => 'Missing Person Alert — Immediate Help Needed',
                'body' => 'A family member of one of our alumni has been reported missing in the Mirpur area since yesterday evening. Please check the attached photo and contact the provided number if you have any information. Every bit of help counts.',
            ],
            [
                'type' => 'registration',
                'title' => 'Rafiq Ahmed joined the community',
                'body' => 'Another classmate has joined! Rafiq Ahmed from Section C is now part of our growing alumni network. He is currently an entrepreneur running an EdTech startup. Welcome aboard!',
            ],
            [
                'type' => 'login',
                'title' => 'Password changed successfully',
                'body' => 'Your account password was changed successfully. If you did not make this change, please contact support immediately to secure your account. We recommend using a strong, unique password for your alumni account.',
            ],
            [
                'type' => 'urgent',
                'title' => 'Natural Disaster Relief — Volunteers Needed',
                'body' => 'Flooding has affected several areas in Sylhet. Our alumni community is organizing relief efforts. We need volunteers for distribution of relief materials this Saturday. Please sign up through the urgent requests page if you can participate.',
            ],
            [
                'type' => 'registration',
                'title' => 'Fatima Begum joined the community',
                'body' => 'Fatima Begum from Section A has joined the alumni platform. She is currently a physician at a renowned hospital. Let us welcome her and reconnect with old friends from school days.',
            ],
        ];

        $users = User::all();

        foreach ($users as $user) {
            foreach ($templates as $index => $template) {
                Notification::create([
                    'user_id' => $user->id,
                    'type' => $template['type'],
                    'title' => $template['title'],
                    'body' => $template['body'],
                    'read_at' => $index >= 3 ? now()->subDays($index) : null,
                    'created_at' => now()->subDays($index)->subHours(rand(0, 12)),
                    'updated_at' => now()->subDays($index)->subHours(rand(0, 12)),
                ]);
            }
        }
    }
}
