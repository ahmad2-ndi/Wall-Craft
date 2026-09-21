// SkillzHub LMS Seed Data and Initial State

const INITIAL_COURSES = [
    {
        id: "cnc-leaf-panel",
        title: "CNC Decorative Leaf Panel",
        category: "Decorative Panels",
        price: "Rs. 8,500",
        priceNumber: 8500,
        icon: "fa-leaf",
        thumbnail: "assets/CNC%201.jpg",
        description: "Elegant CNC-cut leaf pattern panel for feature walls, room dividers, gates, and custom interior decor.",
        instructor: "Wall Crafter",
        level: "Custom Design",
        duration: "Made to Order",
        badge: "Featured Design",
        modules: [
            {
                id: "m-ebay-1",
                title: "Module 1: Introduction to eBay Business Models",
                lessons: [
                    { id: "l-ebay-101", title: "Understanding eBay Platform & Policy Rules", duration: "18:45", videoUrl: "assets/eBay%20Course/1.%20Orientation%20lecture/video1502718736.mp4", completed: false, summary: "Overview of eBay marketplace dynamics, seller levels, fee structures, and account health compliance." },
                    { id: "l-ebay-102", title: "Account Setup: Business vs Personal", duration: "24:10", videoUrl: "assets/eBay%20Course/2.%20ebay%20account%20creation/video1745600091.mp4", completed: false, summary: "Step-by-step guide to setting up stealth and official seller accounts safely." }
                ]
            },
            {
                id: "m-ebay-2",
                title: "Module 2: High-Margin Product Research",
                lessons: [
                    { id: "l-ebay-201", title: "Finding Winning Products with ZIK Analytics", duration: "32:15", videoUrl: "assets/eBay%20Course/8.Amazon%20to%20ebay%20OA%20P1/video1462296295.mp4", completed: false, summary: "Using product research tools to spy on competitors and find high sales-velocity products." },
                    { id: "l-ebay-202", title: "Supplier Sourcing & Price Calculation", duration: "27:50", videoUrl: "assets/eBay%20Course/9.Amazon%20to%20ebay%20OA%20P2/video1820762344.mp4", completed: false, summary: "Calculating profit margins, eBay fees, PayPal/Payoneer fees, and sourcing strategies." }
                ]
            }
        ]
    },
    {
        id: "cnc-geometric-screen",
        title: "CNC Geometric Screen Collection",
        category: "Laser Cut Designs",
        price: "Rs. 12,000",
        priceNumber: 12000,
        icon: "fa-border-all",
        thumbnail: "assets/CNC%202.jpg",
        description: "A versatile collection of geometric CNC screen patterns designed for modern partitions, panels, and architectural details.",
        instructor: "Wall Crafter",
        level: "Custom Design",
        duration: "Made to Order",
        badge: "Best Seller",
        modules: [
            {
                id: "m-web-1",
                title: "Module 1: HTML5 & Modern CSS3 Architecture",
                lessons: [
                    { id: "l-web-101", title: "Semantic HTML5 & Accessibility", duration: "25:00", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", completed: false, summary: "Building structured web pages with semantic tags, forms, and accessibility standards." },
                    { id: "l-web-102", title: "CSS Flexbox & CSS Grid Mastery", duration: "40:15", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", completed: false, summary: "Designing responsive, dynamic layouts using modern CSS techniques." }
                ]
            },
            {
                id: "m-web-2",
                title: "Module 2: JavaScript ES6+ Core Concepts",
                lessons: [
                    { id: "l-web-201", title: "DOM Manipulation & Event Handling", duration: "35:20", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", completed: false, summary: "Connecting HTML UI with JavaScript interactive logic." }
                ]
            }
        ]
    },
    {
        id: "cnc-stair-railing",
        title: "CNC Modern Stair Railing",
        category: "Metal Railing",
        price: "Rs. 45,000",
        priceNumber: 45000,
        icon: "fa-stairs",
        thumbnail: "assets/CNC%203.jpg",
        description: "Statement CNC metal railing design for stairs and balconies, built to add a distinctive modern finish to your space.",
        instructor: "Wall Crafter",
        level: "Custom Fabrication",
        duration: "Made to Order",
        badge: "Premium",
        modules: [
            {
                id: "m-gfx-1",
                title: "Module 1: Color Theory & Typography Rules",
                lessons: [
                    { id: "l-gfx-101", title: "Fundamentals of Visual Design & Layouts", duration: "20:30", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", completed: false, summary: "Understanding contrast, harmony, grid alignment, and font pairing." }
                ]
            }
        ]
    },
    {
        id: "cnc-quran-holder",
        title: "CNC Quran Holder",
        category: "Islamic Decor",
        price: "Rs. 4,500",
        priceNumber: 4500,
        icon: "fa-book-open",
        thumbnail: "assets/Quran%20holder.jpeg",
        description: "A graceful CNC-cut Quran holder with an intricate geometric pattern, designed for beautiful and respectful home display.",
        instructor: "Wall Crafter",
        level: "Finished Product",
        duration: "Ready to Order",
        badge: "Featured",
        modules: []
    },
    // {
    //     id: "course-video",
    //     title: "Video Editing & Motion Graphics Masterclass",
    //     category: "Video Editing",
    //     price: "Rs. 15,000",
    //     priceNumber: 15000,
    //     icon: "fa-film",
    //     thumbnail: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80",
    //     description: "Create stunning videos for YouTube, Reels, Ads, and Cinema. Master Adobe Premiere Pro cutdowns, color grading, sound design, and After Effects motion graphics.",
    //     instructor: "Bilal Tariq",
    //     level: "Intermediate",
    //     duration: "8 Weeks",
    //     badge: "Top Rated",
    //     modules: [
    //         {
    //             id: "m-vid-1",
    //             title: "Module 1: Adobe Premiere Pro Essentials",
    //             lessons: [
    //                 { id: "l-vid-101", title: "Timeline Assembly, Cuts & Pacing", duration: "28:15", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", completed: false, summary: "Importing footage, trimming clips, multi-cam editing, and story pacing." }
    //             ]
    //         }
    //     ]
    // }
];

const INITIAL_USERS = [
    {
        id: "usr-admin-1",
        name: "SkillzHub Admin",
        email: "mr.pakistani@gmail.com",
        password: "abubakar@123",
        role: "admin",
        createdAt: "2026-01-15",
        enrolledCourseIds: ["course-ebay", "course-webdev", "course-graphics", "course-video"],
        completedLessonIds: []
    },
    {
        id: "usr-std-101",
        name: "Usman Ahmed",
        email: "usman@gmail.com",
        password: "student123",
        role: "student",
        createdAt: "2026-02-10",
        enrolledCourseIds: ["course-webdev", "course-ebay"],
        completedLessonIds: ["l-web-101", "l-web-102"]
    },
    {
        id: "usr-std-102",
        name: "Fatima Noor",
        email: "fatima@gmail.com",
        password: "student123",
        role: "student",
        createdAt: "2026-02-20",
        enrolledCourseIds: ["course-graphics", "course-video"],
        completedLessonIds: ["l-gfx-101"]
    }
];

const INITIAL_PAYMENT_REQUESTS = [
    {
        id: "pay-101",
        studentName: "Zubair Khan",
        email: "zubair@gmail.com",
        phone: "0312-9876543",
        courseId: "course-webdev",
        courseTitle: "Full-Stack Web Development BootCamp",
        amount: "Rs. 20,000",
        paymentMethod: "JazzCash / EasyPaisa",
        trxId: "TRX88492015",
        status: "pending",
        submittedAt: "2026-07-23 09:30 AM"
    }
];

const INITIAL_TEAM = [
    {
        id: "team-1",
        name: "Huzefa Imran",
        role: "Instructor of eBay with Advance AI",
        experience: "6+ Years Experience",
        bio: "Huzefa Imran teaches students how to build and scale a profitable eBay business using smart product research, AI-powered listing strategies, and customer conversion techniques. The eBay with Advance AI course focuses on automation, pricing intelligence, and modern marketplace growth methods that help beginners and sellers compete confidently in today's digital commerce environment.",
        courses: "eBay with Advance AI",
        avatar: "assets/Huzefa Imran.jpeg",
        badge: "AI Commerce Coach"
    },
    {
        id: "team-2",
        name: "Umair Afzal",
        role: "Graphic Designer",
        experience: "5+ Years Experience",
        bio: "Umair Afzal helps students master modern graphic design using AI-assisted design workflows, branding principles, and high-converting visual storytelling. In Graphic Designing With Advanced AI, learners build creative confidence by combining traditional design skills with smart tools for social media creatives, posters, brand assets, and digital marketing visuals.",
        courses: "Graphic Designing With Advanced AI",
        avatar: "assets/Umair Afzal.jpeg",
        badge: "Design Mentor"
    },
    {
        id: "team-3",
        name: "Abdullah Salman",
        role: "Web Developer",
        experience: "2+ Years Experience",
        bio: "Abdullah Salman guides students through modern web development with practical coding, responsive UI design, and AI-assisted workflows that speed up problem solving and product building. In Web Development With Advanced AI, learners gain hands-on experience in creating professional websites, mastering front-end logic, and using AI tools to improve code quality, design decisions, and productivity.",
        courses: "Web Development With Advanced AI",
        avatar: "assets/Abdullah Salman.jpeg",
        badge: "Frontend Mentor"
    }
];

const INITIAL_TESTIMONIALS = [];
const INITIAL_REVIEWS = [];
const INITIAL_CONTACT_MESSAGES = [];
const INITIAL_MESSAGE_RECORDS = [];

const INITIAL_FAQS = [
    {
        question: "How do I enroll in a course at SkillzHub?",
        answer: "Click on 'Enroll Now' on any course card or fill out the Online Admission form. Send the course fee to our official JazzCash or Bank account, submit your Transaction ID (Trx ID), and our team will issue your Student LMS login credentials."
    },
    {
        question: "Are the classes live online, recorded, or campus-based?",
        answer: "We offer both live interactive online sessions and recorded video lectures inside your Student Portal, allowing you to learn at your own pace with instructor Q&A support."
    },
    {
        question: "Will I receive a verified certificate upon completion?",
        answer: "Yes! Once you complete 100% of the lessons in your enrolled course, your verified SkillzHub Certificate of Completion becomes instantly downloadable and printable from your dashboard."
    },
    {
        question: "What payment methods are accepted for course fees?",
        answer: "We accept payments via JazzCash, EasyPaisa, and direct Bank Transfer (Meezan Bank). Complete account details are displayed when you click 'Enroll Now'."
    },
    {
        question: "Is there any support available if I get stuck during learning?",
        answer: "Absolutely! Enrolled students get lifetime access to our private WhatsApp/Discord mentor support group where instructors actively answer questions and review assignments."
    }
];

