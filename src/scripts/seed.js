const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/env');
const User = require('../modules/user/user.model');
const Event = require('../modules/event/event.model');
const FormTemplate = require('../modules/form/formTemplate.model');
const Form = require('../modules/form/form.model');
const Exhibitor = require('../modules/exhibitor/exhibitor.model');
const Visitor = require('../modules/visitor/visitor.model');
const Lead = require('../modules/lead/lead.model');
const OrganizerRequest = require('../modules/user/organizer-request.model');
const StallBooking = require('../modules/stall/stall-booking.model');

const seedData = async () => {
    try {
        console.log('🚀 Connecting to Database...');
        await mongoose.connect(config.mongoose.url, config.mongoose.options);
        console.log('✅ Connected.');

        const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
        
        const getRandomDate = (daysAgo) => {
            const date = new Date();
            date.setHours(date.getHours() - getRandomInt(0, 24 * daysAgo));
            return date;
        };

        // 1. Clear existing data and indexes
        console.log('🧹 Clearing existing data and indexes...');
        await Promise.all([
            User.collection.dropIndexes().catch(() => {}),
            User.deleteMany({}),
            Event.deleteMany({}),
            FormTemplate.deleteMany({}),
            Form.deleteMany({}),
            Exhibitor.deleteMany({}),
            Visitor.deleteMany({}),
            Lead.deleteMany({}),
            OrganizerRequest.deleteMany({}),
            StallBooking.deleteMany({}),
        ]);

        // 2. Seed Users
        console.log('👥 Seeding Base Users...');
        const plainPassword = 'admin123';
        const admin = await User.create({
            name: 'VisiTrack Admin',
            email: 'admin@visitrack.in',
            password: plainPassword,
            role: 'ADMIN',
            isEmailVerified: true,
        });

        const organizer = await User.create({
            name: 'Event Organizer',
            email: 'organizer@digitalevents.com',
            password: plainPassword,
            role: 'ORGANIZER',
            isEmailVerified: true,
        });

        const staff = await User.create({
            name: 'Terminal Staff',
            email: 'staff@visitrack.in',
            password: plainPassword,
            role: 'STAFF',
            isEmailVerified: true,
        });

        const testVisitor = await User.create({
            name: 'John Doe',
            email: 'visitor@testmail.com',
            password: plainPassword,
            role: 'VISITOR',
            isEmailVerified: true,
        });

        // 3. Seed Form Templates
        console.log('📝 Seeding Form Templates...');
        const templates = await FormTemplate.insertMany([
            {
                name: 'Standard Exhibition Registry',
                description: 'A comprehensive multi-step form for large-scale expos.',
                steps: [
                    {
                        title: 'Basic Information',
                        description: 'Your fundamental contact details.',
                        fields: [
                            { label: 'Full Name', type: 'text', required: true, placeholder: 'Enter your legal name' },
                            { label: 'Official Email', type: 'email', required: true, placeholder: 'work@company.com' }
                        ]
                    },
                    {
                        title: 'Professional Profile',
                        description: 'Tell us about your industry.',
                        fields: [
                            { label: 'Job Title', type: 'text', required: true },
                            { label: 'Industry Sector', type: 'text', required: true }
                        ]
                    }
                ],
                isDefault: true,
            },
            {
                name: 'Corporate Gala & RSVP',
                description: 'Focus on networking and hospitality.',
                steps: [
                    {
                        title: 'Attendance Details',
                        fields: [
                            { label: 'Full Name', type: 'text', required: true },
                            { label: 'Company Name', type: 'text', required: true },
                            { label: 'Dietary Requirements', type: 'textarea', placeholder: 'e.g., Vegan, Gluten-free' }
                        ]
                    }
                ],
            },
            {
                name: 'Academic Research Summit',
                description: 'Capture institutional data and research areas.',
                steps: [
                    {
                        title: 'Scholar Info',
                        fields: [
                            { label: 'Full Name', type: 'text', required: true },
                            { label: 'Affiliation', type: 'text', required: true },
                            { label: 'Primary Research Area', type: 'select', options: ['AI/ML', 'Biotech', 'Physics', 'Humanities'] }
                        ]
                    }
                ],
            }
        ]);

        const mainTemplate = templates[0];

        // 4. Seed Events
        console.log('📅 Seeding 10+ Diverse Events...');
        const eventNames = [
            'TechConvergence Expo 2026', 'Global Agri-Innovation Summit', 'Future Mobility Showcase',
            'CyberSecurity Frontline 26', 'HealthTech Innovations', 'Renewable Energy Forum',
            'Education & Career Fair', 'Luxury Auto Expo', 'Smart City Logistics', 'Biotech Research Summit'
        ];
        const locations = ['Grand Pavilion, Mumbai', 'HITEX, Hyderabad', 'Pragati Maidan, Delhi', 'BIEC, Bangalore', 'Jio World Centre, Mumbai', 'Chennai Trade Centre'];
        const stallPrefixes = ['A', 'B', 'C', 'D', 'E', 'F'];
        
        const eventDocs = eventNames.map((name, i) => {
            // Assign logical prefixes: T for Tech, G for Global, F for Future, C for Cyber, H for Health, R for Renewable, E for Education, L for Luxury, S for Smart, B for Biotech
            const prefixMap = { 'T': 'Tech', 'G': 'Global', 'F': 'Future', 'C': 'Cyber', 'H': 'Health', 'R': 'Renewable', 'E': 'Education', 'L': 'Luxury', 'S': 'Smart', 'B': 'Biotech' };
            const firstLetter = name.trim().charAt(0).toUpperCase();
            const prefix = Object.keys(prefixMap).includes(firstLetter) ? firstLetter : 'A';

            return {
                name,
                description: `A premier gathering for ${name.split(' ')[0]} industry stakeholders and innovators.`,
                startDate: new Date(Date.now() + getRandomInt(1, 120) * 1000 * 60 * 60 * 24),
                endDate: new Date(Date.now() + getRandomInt(121, 130) * 1000 * 60 * 60 * 24),
                location: locations[i % locations.length],
                organizer: organizer._id,
                maxStalls: getRandomInt(20, 50),
                maxStaffPerEvent: getRandomInt(5, 10),
                stallPrefix: prefix,
                isActive: true,
                createdAt: getRandomDate(7)
            };
        });
        const events = await Event.insertMany(eventDocs);

        // 5. Seed actual Forms (linked to multiple events)
        console.log('📋 Seeding Registration Forms for all events...');
        for (const event of events) {
            await Form.create({
                eventId: event._id,
                title: `${event.name} Official Entry Pass`,
                steps: templates[getRandomInt(0, templates.length - 1)].steps,
                isActive: true,
            });
        }

        // 6. Seed Exhibitors (with Users)
        console.log('🏢 Seeding 50+ Expanded Exhibitors...');
        const companyNames = ['Meta Dynamics', 'Quantum Leap', 'Cyber Solutions', 'Green Earth Tech', 'Astra Analytics', 'LogiLink', 'FinEdge', 'BioSphere', 'CloudNine', 'DataMatrix', 'RoboNext', 'SkyHigh', 'InnoVate', 'FutureForms', 'ApexApp', 'Vertex', 'Nexus', 'Orbital', 'Titan', 'Zenith'];

        const exhibitorsData = [];
        for (let i = 0; i < 55; i++) {
            const company = companyNames[i % companyNames.length] + ' ' + (Math.floor(i / companyNames.length) + 1);
            const email = `exhibitor${i}@example.com`;
            
            const user = await User.create({
                name: `${company} Lead`,
                email: email,
                password: plainPassword,
                role: 'EXHIBITOR',
                isEmailVerified: true
            });

            const event = events[i % events.length];
            const stallId = `${event.stallPrefix}${1 + Math.floor(i / events.length)}`;

            exhibitorsData.push({
                exhibitorDoc: {
                    name: `${company} Lead`,
                    company: company,
                    stallNumber: stallId,
                    userId: user._id,
                    eventId: event._id,
                    status: 'ACTIVE'
                },
                bookingDoc: {
                    eventId: event._id,
                    exhibitorId: user._id,
                    companyName: company,
                    stallId: stallId,
                    status: i % 10 === 0 ? 'PENDING' : 'APPROVED',
                    notes: 'Standard exhibition setup required.',
                    maxStaff: event.maxStaffPerEvent,
                    approvedBy: admin._id,
                    approvedAt: new Date()
                }
            });
        }

        console.log('⛺ Finalizing Exhibitor Registry & Bookings...');
        const exhibitors = await Exhibitor.insertMany(exhibitorsData.map(d => d.exhibitorDoc));
        await StallBooking.insertMany(exhibitorsData.map(d => d.bookingDoc));

        // 7. Seed Visitors (Huge Data)
        console.log('👤 Seeding 300+ Visitors...');
        const firstNames = ['Amit', 'Priya', 'Rahul', 'Sneha', 'Vikram', 'Anjali', 'Deepak', 'Kavita', 'Suresh', 'Meera', 'Rajesh', 'Pooja', 'Arjun', 'Sanjana', 'Manish', 'Neha', 'Sunil', 'Ritu', 'Vijay', 'Swati', 'Karan', 'Simran', 'Aakash', 'Ishani', 'Rohan'];
        const lastNames = ['Sharma', 'Verma', 'Gupta', 'Singh', 'Patel', 'Reddy', 'Nair', 'Iyer', 'Joshi', 'Chopra', 'Malhotra', 'Bose', 'Das', 'Khan', 'Yadav', 'Kulkarni', 'Deshmukh', 'Pillai', 'Menon'];

        const visitorDocs = [];
        for (let i = 0; i < 320; i++) {
            const firstName = firstNames[getRandomInt(0, firstNames.length - 1)];
            const lastName = lastNames[getRandomInt(0, lastNames.length - 1)];
            const status = i % 3 === 0 ? 'CHECKED_IN' : (i % 8 === 0 ? 'CHECKED_OUT' : 'PENDING');
            
            visitorDocs.push({
                name: `${firstName} ${lastName}`,
                email: `visitor${i}@testmail.com`,
                phone: `+91 ${getRandomInt(7000000000, 9999999999)}`,
                eventId: events[i % events.length]._id,
                status: status,
                checkInTime: status === 'CHECKED_IN' ? new Date(Date.now() - getRandomInt(0, 1000 * 60 * 60 * 24)) : null,
                ticketType: i % 5 === 0 ? 'VIP' : 'Standard',
                paymentStatus: i % 10 === 0 ? 'PENDING' : 'PAID',
                createdAt: getRandomDate(7)
            });
        }
        const visitors = await Visitor.insertMany(visitorDocs);

        // 8. Seed Leads (Mapping Visitors to Exhibitors)
        console.log('🎯 Seeding 150+ Leads...');
        const leadDocs = [];
        const leadSet = new Set();

        for (let i = 0; i < 180; i++) {
            const visitor = visitors[getRandomInt(0, visitors.length - 1)];
            // Find exhibitors for the same event
            const sameEventExhibitors = exhibitors.filter(ex => ex.eventId.toString() === visitor.eventId.toString());
            
            if (sameEventExhibitors.length > 0) {
                const exhibitor = sameEventExhibitors[getRandomInt(0, sameEventExhibitors.length - 1)];
                const comboKey = `${visitor._id}-${exhibitor._id}`;
                
                if (!leadSet.has(comboKey)) {
                    leadDocs.push({
                        visitorId: visitor._id,
                        exhibitorId: exhibitor._id,
                        eventId: visitor.eventId,
                        capturedBy: exhibitor.userId,
                        notes: 'Interested in product demo and pricing.',
                        rating: getRandomInt(1, 5),
                        status: i % 3 === 0 ? 'HOT' : (i % 3 === 1 ? 'WARM' : 'COLD'),
                        createdAt: getRandomDate(7)
                    });
                    leadSet.add(comboKey);
                }
            }
        }
        await Lead.insertMany(leadDocs);

        // 9. Seed Organizer Requests
        console.log('📩 Seeding Organizer Requests...');
        const requestDocs = [
            { name: 'Alice Tech Events', email: 'alice@techevents.com', businessName: 'TechEvents Global', description: 'Looking to organize a 500+ attendee developer conference.', status: 'PENDING' },
            { name: 'Bob Logistics', email: 'bob@logistics.in', businessName: 'QuickLogistics Expo', description: 'National logistics and supply chain exhibition.', status: 'APPROVED' },
            { name: 'Charlie Medical', email: 'charlie@med-expo.com', businessName: 'MedTech Horizons', description: 'Specialized medical equipment showcase.', status: 'REJECTED', adminNotes: 'Insufficient business documentation.' }
        ];
        await OrganizerRequest.insertMany(requestDocs);

        console.log('✨ Database Seeded Successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding Error:', error);
        process.exit(1);
    }
};

seedData();
