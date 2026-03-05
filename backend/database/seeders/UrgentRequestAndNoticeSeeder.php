<?php

namespace Database\Seeders;

use App\Models\ProfessionalNotice;
use App\Models\UrgentRequest;
use App\Models\User;
use Illuminate\Database\Seeder;

class UrgentRequestAndNoticeSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::with('alumniRecord')->get();
        if ($users->isEmpty()) {
            return;
        }

        // ── Urgent Requests ──────────────────────────────────
        $urgentRequests = [
            [
                'title' => 'O+ Blood Needed Urgently',
                'type_of_emergency' => 'Blood Donation',
                'urgency_level' => 'critical',
                'date_needed' => '2026-03-05',
                'location' => 'Dhaka Medical College Hospital',
                'contact_person' => 'Shahid Alam',
                'contact_number' => '+880 1711-234567',
                'description' => 'My father is undergoing emergency surgery and needs 3 bags of O+ blood immediately. Please reach out if you can donate. The surgery is scheduled for tomorrow morning at 8 AM.',
                'status' => 'open',
            ],
            [
                'title' => 'Financial Help for Flood-Affected Family',
                'type_of_emergency' => 'Natural Disaster',
                'urgency_level' => 'high',
                'date_needed' => '2026-03-15',
                'location' => 'Sylhet, Bangladesh',
                'contact_person' => 'Moinul Islam',
                'contact_number' => '+880 1891-345678',
                'description' => 'A fellow batch-mate\'s family in Sylhet has been severely affected by recent flooding. Their home is damaged and they need financial support for immediate relief. Any contribution will help them rebuild.',
                'status' => 'open',
            ],
            [
                'title' => 'Emergency Medical Fund for Classmate',
                'type_of_emergency' => 'Medical Emergency',
                'urgency_level' => 'critical',
                'date_needed' => '2026-03-08',
                'location' => 'Square Hospital, Dhaka',
                'contact_person' => 'Fahim Chowdhury',
                'contact_number' => '+880 1612-456789',
                'description' => 'Our classmate Arif needs an urgent kidney transplant. The estimated cost is 12 lakh BDT. Any contribution, big or small, will be greatly appreciated. He has been on dialysis for the past 6 months.',
                'status' => 'open',
            ],
            [
                'title' => 'Missing Person — Batch-mate\'s Father',
                'type_of_emergency' => 'Missing Person',
                'urgency_level' => 'high',
                'date_needed' => '2026-03-03',
                'location' => 'Mirpur, Dhaka',
                'contact_person' => 'Kamrul Hasan',
                'contact_number' => '+880 1711-987654',
                'description' => 'Our batch-mate Kamrul\'s father has been missing since yesterday evening. He was last seen near Mirpur-10 bus stand. He is 72 years old and suffers from early-stage dementia. If you have any information, please contact immediately.',
                'status' => 'open',
            ],
            [
                'title' => 'B- Blood Required for Child',
                'type_of_emergency' => 'Blood Donation',
                'urgency_level' => 'critical',
                'date_needed' => '2026-03-04',
                'location' => 'Chittagong Medical College',
                'contact_person' => 'Nayeem Uddin',
                'contact_number' => '+880 1811-112233',
                'description' => 'A 7-year-old child of our batch-mate Nayeem needs 2 units of B-negative blood for a thalassemia transfusion. B- is very rare. Please help if you are a donor or know someone who can donate.',
                'status' => 'open',
            ],
            [
                'title' => 'Accident — Immediate Assistance Needed',
                'type_of_emergency' => 'Accident',
                'urgency_level' => 'high',
                'date_needed' => '2026-03-03',
                'location' => 'Dhaka-Chittagong Highway, Comilla',
                'contact_person' => 'Shamim Ahsan',
                'contact_number' => '+880 1911-554433',
                'description' => 'Our batch-mate Shamim was involved in a road accident on the Dhaka-Chittagong highway near Comilla. He has been admitted to a local hospital and needs to be transferred to Dhaka for better treatment. We need volunteers with vehicles and financial assistance for hospital bills.',
                'status' => 'open',
            ],
            [
                'title' => 'Death of Batch-mate\'s Mother — Condolence & Support',
                'type_of_emergency' => 'Death News',
                'urgency_level' => 'medium',
                'date_needed' => '2026-03-04',
                'location' => 'Banani Graveyard, Dhaka',
                'contact_person' => 'Tariq Anwar',
                'contact_number' => '+880 1711-667788',
                'description' => 'With deep sorrow, we inform you that the mother of our batch-mate Tariq passed away last night. The janaza prayer will be held at Banani Mosque after Zuhr prayer tomorrow. Please keep the family in your prayers and offer your condolences.',
                'status' => 'open',
            ],
        ];

        foreach ($urgentRequests as $i => $data) {
            $user = $users[$i % $users->count()];
            UrgentRequest::create(array_merge($data, [
                'user_id' => $user->id,
                'created_at' => now()->subDays($i),
                'updated_at' => now()->subDays($i),
            ]));
        }

        // ── Professional Notices ─────────────────────────────
        $professionalNotices = [
            [
                'title' => 'Looking for Full-Stack Developer',
                'requirement_type' => 'Job',
                'industry' => 'Technology',
                'location' => 'Dhaka, Bangladesh',
                'details' => 'We are looking for an experienced full-stack developer with expertise in React and Node.js for our growing startup. Must have 3+ years of experience. Competitive salary and equity options available.',
                'status' => 'active',
            ],
            [
                'title' => 'Business Partnership — Export/Import',
                'requirement_type' => 'Partnership',
                'industry' => 'Trade & Commerce',
                'location' => 'Chittagong, Bangladesh',
                'details' => 'Seeking a reliable partner for an export/import business focusing on garment accessories. Investment and operational support needed. Established client base in Europe and North America.',
                'status' => 'active',
            ],
            [
                'title' => 'Need Marketing Consultant',
                'requirement_type' => 'Service',
                'industry' => 'Marketing',
                'location' => 'Remote',
                'details' => 'Looking for a marketing consultant to help with digital strategy and social media management for a healthcare startup launching next quarter. Budget: 50K-80K BDT/month.',
                'status' => 'active',
            ],
            [
                'title' => 'Investment Opportunity — EdTech Platform',
                'requirement_type' => 'Investment',
                'industry' => 'Education',
                'location' => 'Dhaka, Bangladesh',
                'details' => 'Seeking angel investors for an EdTech platform targeting SSC and HSC students. Already have 5,000+ beta users and growing rapidly. Looking for 30 lakh BDT in seed funding for a 10% equity stake.',
                'status' => 'active',
            ],
            [
                'title' => 'Senior Accountant Position Open',
                'requirement_type' => 'Job',
                'industry' => 'Finance & Banking',
                'location' => 'Dhaka, Bangladesh',
                'details' => 'Our firm is hiring a senior accountant with CA/CMA certification. 5+ years experience in audit and tax compliance required. Attractive package with annual bonus. Priority given to fellow alumni.',
                'status' => 'active',
            ],
            [
                'title' => 'Co-Founder Needed for Food Delivery App',
                'requirement_type' => 'Partnership',
                'industry' => 'Food & Beverage',
                'location' => 'Dhaka, Bangladesh',
                'details' => 'Building a niche food delivery platform focused on home-cooked meals. Looking for a technical co-founder who can lead the engineering team. Equity split negotiable. We already have 200+ home cooks onboarded.',
                'status' => 'active',
            ],
            [
                'title' => 'Freelance Graphic Designer Wanted',
                'requirement_type' => 'Service',
                'industry' => 'Design & Creative',
                'location' => 'Remote',
                'details' => 'Need a talented graphic designer for branding and packaging design for a new organic skincare line. Project-based work with potential for long-term collaboration. Portfolio required.',
                'status' => 'active',
            ],
            [
                'title' => 'Legal Advisor for Startup',
                'requirement_type' => 'Service',
                'industry' => 'Legal',
                'location' => 'Dhaka, Bangladesh',
                'details' => 'Our tech startup needs a legal advisor for company incorporation, shareholder agreements, and regulatory compliance. Preferably someone familiar with BIDA and RJSC processes. Retainer basis preferred.',
                'status' => 'active',
            ],
            [
                'title' => 'Warehouse Space Available for Rent',
                'requirement_type' => 'Other',
                'industry' => 'Real Estate',
                'location' => 'Gazipur, Bangladesh',
                'details' => 'I have a 5,000 sq ft warehouse space available near Gazipur Chowrasta. Suitable for garments, packaging, or e-commerce storage. Reasonable rent for fellow alumni. Contact for site visit.',
                'status' => 'active',
            ],
            [
                'title' => 'Looking for Physician for Company Health Program',
                'requirement_type' => 'Service',
                'industry' => 'Healthcare',
                'location' => 'Dhaka, Bangladesh',
                'details' => 'We run a garments factory with 1,200 workers and need a part-time physician for our employee health program. 3 days/week, flexible hours. Fellow alumni doctors are encouraged to apply.',
                'status' => 'active',
            ],
        ];

        foreach ($professionalNotices as $i => $data) {
            $user = $users[$i % $users->count()];
            ProfessionalNotice::create(array_merge($data, [
                'user_id' => $user->id,
                'created_at' => now()->subDays($i * 2),
                'updated_at' => now()->subDays($i * 2),
            ]));
        }
    }
}
