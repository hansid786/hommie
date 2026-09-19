package com.example.hommie.data.repository

import com.example.hommie.data.model.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class HommieRepository {

    // 1. Cities & Localities (Lucknow focus)
    val cities = listOf(
        City(
            id = "lko",
            name = "Lucknow",
            state = "Uttar Pradesh",
            active = true,
            localities = listOf(
                Locality("gomti-nagar", "Gomti Nagar", "226010", true, listOf("electrician", "plumber", "ac-service", "appliance", "carpenter", "cleaning"), 26.8500, 80.9950),
                Locality("hazratganj", "Hazratganj", "226001", true, listOf("electrician", "plumber", "ac-service", "appliance", "carpenter", "cleaning"), 26.8467, 80.9462),
                Locality("aliganj", "Aliganj", "226024", true, listOf("electrician", "plumber", "ac-service", "appliance"), 26.8850, 80.9400),
                Locality("indira-nagar-lko", "Indira Nagar", "226016", true, listOf("electrician", "plumber", "ac-service", "appliance", "cleaning"), 26.8780, 80.9850)
            )
        )
    )

    private val _activeLocality = MutableStateFlow(cities[0].localities[0])
    val activeLocality: StateFlow<Locality> = _activeLocality.asStateFlow()

    // 2. Categories
    val categories = listOf(
        Category(
            id = "ac-service",
            slug = "ac-service",
            name = "AC Service & Repair",
            shortName = "AC Care",
            iconName = "ac_unit",
            colorHex = "#0284C7",
            badge = "Seasonal Essential",
            headline = "Certified HVAC technicians for servicing, gas refill & repairs",
            inspectionFee = 249,
            startingPrice = 499,
            urgentAvailable = true,
            services = listOf(
                ServiceItem("ac-deep-clean", "Foam Jet Deep Cleaning (Split/Window)", "45 mins", 499, "fixed"),
                ServiceItem("ac-gas-charge", "Refrigerant Gas Top-up & Leak Fix", "60 mins", 1850, "starting"),
                ServiceItem("ac-install", "Split AC Installation with Bracket", "90 mins", 1200, "fixed"),
                ServiceItem("ac-diagnostics", "Cooling Breakdown Inspection", "30 mins", 249, "inspection")
            )
        ),
        Category(
            id = "electrician",
            slug = "electrician",
            name = "Electrician",
            shortName = "Electrical",
            iconName = "bolt",
            colorHex = "#D97706",
            badge = "15-min Urgent Available",
            headline = "Licensed wiremen for switchboards, MCBs, lighting & tripping",
            inspectionFee = 149,
            startingPrice = 199,
            urgentAvailable = true,
            services = listOf(
                ServiceItem("elec-tripping", "Short Circuit & MCB Tripping Diagnostic", "30 mins", 249, "inspection"),
                ServiceItem("elec-fan-install", "Ceiling Fan / Chandelier Installation", "30 mins", 199, "fixed"),
                ServiceItem("elec-switch-replace", "Switchboard Socket Replacement (Up to 3)", "25 mins", 179, "fixed"),
                ServiceItem("elec-inverter", "Inverter & Home Battery Wiring Setup", "60 mins", 549, "starting")
            )
        ),
        Category(
            id = "plumber",
            slug = "plumber",
            name = "Plumber",
            shortName = "Plumbing",
            iconName = "water_drop",
            colorHex = "#2563EB",
            badge = "Leak Emergency",
            headline = "Experienced plumbers for leakages, taps, drains & motor pumps",
            inspectionFee = 149,
            startingPrice = 199,
            urgentAvailable = true,
            services = listOf(
                ServiceItem("plumb-leak-fix", "Concealed Pipe Leakage Detection & Repair", "45 mins", 299, "starting"),
                ServiceItem("plumb-tap-replace", "Tap / Shower Diverter Replacement", "30 mins", 199, "fixed"),
                ServiceItem("plumb-drain-clear", "Kitchen Sink / Basin Drain Clog Clearing", "40 mins", 349, "fixed"),
                ServiceItem("plumb-motor-pump", "Water Motor Pump Repair & Connection", "60 mins", 499, "starting")
            )
        ),
        Category(
            id = "appliance",
            slug = "appliance",
            name = "Appliance Repair",
            shortName = "Appliances",
            iconName = "memory",
            colorHex = "#059669",
            badge = "Multi-Brand",
            headline = "Specialists in Washing Machines, Refrigerators, RO & Microwaves",
            inspectionFee = 199,
            startingPrice = 299,
            urgentAvailable = false,
            services = listOf(
                ServiceItem("app-ro-service", "RO Water Purifier Filter & Membrane Service", "45 mins", 399, "fixed"),
                ServiceItem("app-wm-service", "Washing Machine Drum & Motor Diagnostics", "45 mins", 199, "inspection"),
                ServiceItem("app-fridge-service", "Refrigerator Cooling & Compressor Check", "40 mins", 249, "inspection"),
                ServiceItem("app-geyser-repair", "Geyser Heating Element / Thermostat Repair", "45 mins", 349, "starting")
            )
        ),
        Category(
            id = "carpenter",
            slug = "carpenter",
            name = "Carpenter",
            shortName = "Carpentry",
            iconName = "handyman",
            colorHex = "#EA580C",
            badge = "Furniture & Doors",
            headline = "Master woodworkers for door locks, hinges, furniture assembly & fixes",
            inspectionFee = 149,
            startingPrice = 249,
            urgentAvailable = false,
            services = listOf(
                ServiceItem("carp-lock-install", "Main Door Lock & Handle Installation", "45 mins", 349, "fixed"),
                ServiceItem("carp-furniture-assembly", "Modular Bed / Wardrobe Assembly", "90 mins", 699, "starting"),
                ServiceItem("carp-hinge-fix", "Cabinet Channel / Drawer Hinge Repair", "30 mins", 249, "fixed")
            )
        ),
        Category(
            id = "cleaning",
            slug = "cleaning",
            name = "Deep Cleaning",
            shortName = "Cleaning",
            iconName = "cleaning_services",
            colorHex = "#9333EA",
            badge = "Eco-Friendly",
            headline = "Intensive home, bathroom, kitchen & sofa sanitization specialists",
            inspectionFee = 0,
            startingPrice = 499,
            urgentAvailable = false,
            services = listOf(
                ServiceItem("clean-bathroom", "Intensive Bathroom Scale & Tile Descaling", "60 mins", 499, "fixed"),
                ServiceItem("clean-kitchen", "Kitchen Degreasing & Chimney Scrubbing", "90 mins", 999, "fixed"),
                ServiceItem("clean-full-home", "Full Home Deep Sanitization (2BHK)", "240 mins", 2499, "fixed"),
                ServiceItem("clean-sofa-shampoo", "3-Seater Sofa Fabric Shampoo & Vacuum", "60 mins", 599, "fixed")
            )
        )
    )

    // 3. Professionals
    private val _professionals = MutableStateFlow<List<Professional>>(
        listOf(
            Professional(
                id = "pro-arjun",
                userId = "u-pro-1",
                name = "Arjun Singh",
                trade = "AC Service & Repair Specialist",
                categoryIds = listOf("ac-service", "appliance"),
                avatarUrl = "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=200&auto=format&fit=crop&q=80",
                headline = "11+ Years Experience • HVAC Certified • Daikin & Voltas Master",
                about = "Over a decade servicing residential air conditioners across Lucknow. I believe in transparent troubleshooting: I always demonstrate what part is faulty before quoting.",
                phone = "+91 98450 21984",
                email = "arjun.hvac@hommie.pro",
                city = "Lucknow",
                primaryLocality = "Gomti Nagar",
                serviceLocalities = listOf("Gomti Nagar", "Hazratganj", "Aliganj", "Indira Nagar"),
                serviceRadiusKm = 12,
                languages = listOf("Hindi", "English"),
                experienceYears = 11,
                baseRate = 499,
                inspectionFee = 249,
                pricingModel = "starting",
                isAvailable = true,
                availableNow = true,
                earliestArrivalMins = 20,
                ratingAvg = 4.9,
                ratingCount = 148,
                jobsCompleted = 312,
                payoutBank = PayoutBank("Arjun Singh", "•••• •••• 8842", "HDFC0001245", "arjun.singh@okhdfcbank"),
                portfolio = listOf(
                    PortfolioItem("p1", "Copper Pipe Gas Leakage Repair", "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80"),
                    PortfolioItem("p2", "Dual Inverter Split AC Setup", "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80")
                ),
                reviews = listOf(
                    Review("r1", "Siddharth M.", 5, "3 days ago", "Arjun diagnosed our AC cooling issue in 15 mins. Super clean foam jet service.", "AC Deep Clean"),
                    Review("r2", "Priya Narayanan", 5, "2 weeks ago", "Extremely reliable and fair pricing. No hidden fees.", "Foam Jet Deep Cleaning")
                )
            ),
            Professional(
                id = "pro-imran",
                userId = "u-pro-2",
                name = "Imran Khan",
                trade = "Senior Master Plumber",
                categoryIds = listOf("plumber"),
                avatarUrl = "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80",
                headline = "8 Years Experience • Expert in Concealed Leakages & Motor Pumps",
                about = "Government ITI certified plumber with hands-on expertise in multi-story residential plumbing, pressure pumps, and fittings like Jaquar and Kohler.",
                phone = "+91 97412 88491",
                email = "imran.plumbing@hommie.pro",
                city = "Lucknow",
                primaryLocality = "Hazratganj",
                serviceLocalities = listOf("Hazratganj", "Gomti Nagar", "Aliganj"),
                serviceRadiusKm = 10,
                languages = listOf("Hindi", "Urdu", "English"),
                experienceYears = 8,
                baseRate = 299,
                inspectionFee = 149,
                pricingModel = "starting",
                isAvailable = true,
                availableNow = true,
                earliestArrivalMins = 15,
                ratingAvg = 4.8,
                ratingCount = 94,
                jobsCompleted = 186,
                payoutBank = PayoutBank("Imran Khan", "•••• •••• 3190", "SBIN0004210", "imrankhan@icici"),
                reviews = listOf(
                    Review("r3", "Vikram Seth", 5, "1 week ago", "Fixed persistent kitchen drain leak in 20 mins. Highly recommend!", "Concealed Pipe Leak")
                )
            ),
            Professional(
                id = "pro-rohit",
                userId = "u-pro-3",
                name = "Rohit Verma",
                trade = "Licensed Master Electrician",
                categoryIds = listOf("electrician"),
                avatarUrl = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
                headline = "9 Years Experience • Grade-A Wireman License • Smart Home Wiring",
                about = "Handling all home electrical work: distribution box overhauls, inverter installations, and safety earth-leakage inspections.",
                phone = "+91 94150 33812",
                email = "rohit.electric@hommie.pro",
                city = "Lucknow",
                primaryLocality = "Gomti Nagar",
                serviceLocalities = listOf("Gomti Nagar", "Indira Nagar", "Hazratganj"),
                serviceRadiusKm = 15,
                languages = listOf("Hindi", "English"),
                experienceYears = 9,
                baseRate = 249,
                inspectionFee = 149,
                pricingModel = "starting",
                isAvailable = true,
                availableNow = true,
                earliestArrivalMins = 25,
                ratingAvg = 4.9,
                ratingCount = 112,
                jobsCompleted = 240,
                payoutBank = PayoutBank("Rohit Verma", "•••• •••• 9912", "PUNB0123400", "rohit.wireman@axl"),
                reviews = listOf(
                    Review("r4", "Ananya Rao", 5, "5 days ago", "Safe, quick, and neat work. Fixed short circuit breaker immediately.", "MCB Tripping Fix")
                )
            ),
            Professional(
                id = "pro-sunita",
                userId = "u-pro-4",
                name = "Sunita Devi",
                trade = "Deep Sanitization & Housekeeping Lead",
                categoryIds = listOf("cleaning"),
                avatarUrl = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
                headline = "7 Years Experience • Chemical-Safe Certified • 5-Star Cleanliness",
                about = "Leading an independent crew of trained cleaners. We use certified non-toxic Taski solutions and steam sanitization.",
                phone = "+91 96110 55210",
                email = "sunita.cleaning@hommie.pro",
                city = "Lucknow",
                primaryLocality = "Indira Nagar",
                serviceLocalities = listOf("Indira Nagar", "Gomti Nagar", "Hazratganj"),
                serviceRadiusKm = 10,
                languages = listOf("Hindi"),
                experienceYears = 7,
                baseRate = 499,
                inspectionFee = 0,
                pricingModel = "fixed",
                isAvailable = true,
                availableNow = false,
                earliestArrivalMins = 60,
                ratingAvg = 4.9,
                ratingCount = 76,
                jobsCompleted = 142,
                reviews = listOf(
                    Review("r5", "Manish Kaul", 5, "2 weeks ago", "Bathrooms look brand new. Very thorough and punctual.", "Bathroom Deep Clean")
                )
            ),
            Professional(
                id = "pro-dinesh",
                userId = "u-pro-5",
                name = "Dinesh Kumar",
                trade = "Appliance Repair Technician",
                categoryIds = listOf("appliance"),
                avatarUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
                headline = "6 Years Experience • RO Water Purifiers & Washing Machine Specialist",
                about = "Specialist in Kent, Aquaguard, Pureit RO water purifiers, and front/top load washing machines. Genuine spares only.",
                phone = "+91 98860 11982",
                email = "dinesh.appliance@hommie.pro",
                city = "Lucknow",
                primaryLocality = "Aliganj",
                serviceLocalities = listOf("Aliganj", "Hazratganj", "Indira Nagar"),
                serviceRadiusKm = 10,
                languages = listOf("Hindi", "English"),
                experienceYears = 6,
                baseRate = 399,
                inspectionFee = 199,
                pricingModel = "starting",
                isAvailable = true,
                availableNow = true,
                earliestArrivalMins = 30,
                ratingAvg = 4.7,
                ratingCount = 58,
                jobsCompleted = 110,
                reviews = listOf(
                    Review("r6", "Deepak J.", 5, "1 month ago", "Replaced RO filters and tuned TDS. Very polite technician.", "RO Purifier Service")
                )
            ),
            Professional(
                id = "pro-rajesh",
                userId = "u-pro-6",
                name = "Rajesh Mistry",
                trade = "Master Furniture & Woodwork Carpenter",
                categoryIds = listOf("carpenter"),
                avatarUrl = "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80",
                headline = "14 Years Experience • Architectural Woodwork & Door Specialist",
                about = "Precision lock fitting, door realignment, modular furniture assembly, and kitchen cabinet hardware replacement.",
                phone = "+91 93420 77190",
                email = "rajesh.mistry@hommie.pro",
                city = "Lucknow",
                primaryLocality = "Gomti Nagar",
                serviceLocalities = listOf("Gomti Nagar", "Hazratganj"),
                serviceRadiusKm = 10,
                languages = listOf("Hindi"),
                experienceYears = 14,
                baseRate = 349,
                inspectionFee = 149,
                pricingModel = "starting",
                isAvailable = true,
                availableNow = true,
                earliestArrivalMins = 45,
                ratingAvg = 4.8,
                ratingCount = 82,
                jobsCompleted = 165,
                reviews = listOf(
                    Review("r7", "Anita Menon", 5, "3 weeks ago", "Fixed stuck wardrobe doors cleanly and quickly.", "Wardrobe Hinge Fix")
                )
            )
        )
    )
    val professionals: StateFlow<List<Professional>> = _professionals.asStateFlow()

    // 4. Bookings
    private val _bookings = MutableStateFlow<List<Booking>>(
        listOf(
            Booking(
                id = "b-active-1",
                bookingRef = "HOM-2026-9812",
                customerId = "u-cust-1",
                customerName = "Hanzala Siddiqui",
                customerPhone = "+91 98450 77123",
                workerId = "pro-arjun",
                workerName = "Arjun Singh",
                workerTrade = "AC Service & Repair Specialist",
                workerPhone = "+91 98450 21984",
                workerAvatar = "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=200&auto=format&fit=crop&q=80",
                categoryId = "ac-service",
                serviceTitle = "Foam Jet Deep Cleaning (Split AC)",
                servicePrice = 499,
                inspectionFee = 249,
                platformFee = 15,
                safetyFee = 15,
                bookingType = "instant",
                scheduledDate = "Today",
                scheduledTimeSlot = "Arriving in ~18 mins (Instant)",
                status = "en_route",
                statusHistory = listOf(
                    StatusHistoryItem("requested", "15 mins ago", "Customer", "Instant request initiated"),
                    StatusHistoryItem("pro_assigned", "12 mins ago", "System", "Arjun Singh confirmed dispatch"),
                    StatusHistoryItem("en_route", "8 mins ago", "Arjun Singh", "Technician en route with equipment")
                ),
                addressFormatted = "Flat 402, Royal Palms, 12th Main Rd, Gomti Nagar, Lucknow",
                locality = "Gomti Nagar",
                city = "Lucknow",
                problemDescription = "AC indoor unit blowing low air with mild whistling sound.",
                pricingSummary = PricingSummary(baseQuote = 499, finalAmount = 529),
                locationSharing = LocationSharingState(
                    customerSharing = true,
                    workerSharing = true,
                    workerLocation = LocationCoordinate(26.8520, 80.9910, "Just now")
                ),
                messages = listOf(
                    BookingMessage("m1", "worker", "Arjun Singh", "Namaste Hanzala ji, I am on Main Road now. ETA 15 mins.", "8 mins ago"),
                    BookingMessage("m2", "customer", "Hanzala Siddiqui", "Great! Please buzz flat 402 at the gate.", "6 mins ago")
                ),
                createdAt = "15 mins ago",
                etaMinutes = 18
            ),
            Booking(
                id = "b-completed-2",
                bookingRef = "HOM-2026-9740",
                customerId = "u-cust-1",
                customerName = "Hanzala Siddiqui",
                customerPhone = "+91 98450 77123",
                workerId = "pro-imran",
                workerName = "Imran Khan",
                workerTrade = "Senior Master Plumber",
                workerPhone = "+91 97412 88491",
                workerAvatar = "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80",
                categoryId = "plumber",
                serviceTitle = "Concealed Pipe Leakage Detection & Repair",
                servicePrice = 599,
                inspectionFee = 149,
                platformFee = 15,
                safetyFee = 15,
                bookingType = "scheduled",
                scheduledDate = "28 Aug 2026",
                scheduledTimeSlot = "2:00 PM – 3:30 PM",
                status = "completed",
                statusHistory = listOf(
                    StatusHistoryItem("requested", "28 Aug", "Customer", "Booking requested"),
                    StatusHistoryItem("completed", "28 Aug", "System", "Service completed and verified")
                ),
                addressFormatted = "Flat 402, Royal Palms, Gomti Nagar, Lucknow",
                locality = "Gomti Nagar",
                city = "Lucknow",
                problemDescription = "Washbasin drain leaking under cabinet.",
                pricingSummary = PricingSummary(baseQuote = 599, finalAmount = 629),
                payment = PaymentInfo(status = "paid", method = "upi", transactionId = "TXN-HOM-9740", amount = 629, paidAt = "28 Aug 03:20 PM"),
                customerRating = RatingReview(rating = 5, comment = "Replaced seal washer in 20 mins. Zero mess.", date = "28 Aug", customerName = "Hanzala", serviceRendered = "Leak Repair"),
                createdAt = "28 Aug 2026",
                etaMinutes = 0
            )
        )
    )
    val bookings: StateFlow<List<Booking>> = _bookings.asStateFlow()

    // 5. Home Assets
    private val _homeAssets = MutableStateFlow<List<HomeAsset>>(
        listOf(
            HomeAsset(
                id = "asset-ac-living",
                name = "Living Room Split AC",
                category = "ac-service",
                brand = "Daikin 1.5 Ton Inverter",
                installedDate = "March 2024",
                locationRoom = "Living Room",
                warrantyStatus = "Active (Compressor Warranty until 2029)",
                lastServiced = "15 March 2026",
                servicedByProName = "Arjun Singh",
                serviceFrequencyMonths = 6,
                nextDueReminderDate = "15 Sept 2026",
                reminderNote = "Post-monsoon filter deep clean & pressure check",
                status = "due_soon",
                history = listOf(
                    AssetServiceEntry("15 Mar 2026", "Foam Jet Deep Cleaning", 499, "Arjun Singh", "INV-HOM-2601")
                )
            ),
            HomeAsset(
                id = "asset-ro-kitchen",
                name = "Kitchen RO Water Purifier",
                category = "appliance",
                brand = "Kent Grand Plus 9L",
                installedDate = "Jan 2024",
                locationRoom = "Kitchen Sink",
                warrantyStatus = "Standard Care",
                lastServiced = "10 Dec 2025",
                servicedByProName = "Dinesh Kumar",
                serviceFrequencyMonths = 6,
                nextDueReminderDate = "10 June 2026",
                reminderNote = "Sediment & Carbon filter cartridge replacement",
                status = "healthy",
                history = listOf(
                    AssetServiceEntry("10 Dec 2025", "Filter & Membrane Tune", 650, "Dinesh Kumar", "INV-HOM-2540")
                )
            ),
            HomeAsset(
                id = "asset-elec-db",
                name = "Main Distribution Board",
                category = "electrician",
                brand = "Schneider Electric 8-Way RCCB",
                installedDate = "2023",
                locationRoom = "Hallway Foyer",
                warrantyStatus = "Lifetime Board",
                lastServiced = "02 Feb 2026",
                servicedByProName = "Rohit Verma",
                serviceFrequencyMonths = 12,
                nextDueReminderDate = "02 Feb 2027",
                reminderNote = "Earth-leakage trip test & load balance",
                status = "healthy",
                history = listOf(
                    AssetServiceEntry("02 Feb 2026", "Safety Trip Test", 350, "Rohit Verma", "INV-HOM-2571")
                )
            )
        )
    )
    val homeAssets: StateFlow<List<HomeAsset>> = _homeAssets.asStateFlow()

    // 6. Audit Logs
    private val _auditLogs = MutableStateFlow<List<AuditLog>>(
        listOf(
            AuditLog("l-1", "2026-08-28 10:15", "System", "BOOKING_CREATED", "Seed booking HOM-2026-9740 initiated in Gomti Nagar"),
            AuditLog("l-2", "2026-08-28 15:20", "Customer", "PAYMENT_CAPTURED", "Paid ₹629 via PhonePe UPI (Ref: TXN-HOM-9740)"),
            AuditLog("l-3", "Today 13:10", "System", "DISPATCH_CONFIRMED", "Arjun Singh assigned to HOM-2026-9812")
        )
    )
    val auditLogs: StateFlow<List<AuditLog>> = _auditLogs.asStateFlow()

    // 7. Safety Reports
    private val _safetyReports = MutableStateFlow<List<SafetyReport>>(emptyList())
    val safetyReports: StateFlow<List<SafetyReport>> = _safetyReports.asStateFlow()

    // Methods
    fun setLocality(locality: Locality) {
        _activeLocality.value = locality
        recordLog("Location updated to ${locality.name}, Lucknow", "Customer")
    }

    fun recordLog(details: String, actor: String = "System") {
        val timeStr = SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.getDefault()).format(Date())
        val newLog = AuditLog("l-${System.currentTimeMillis()}", timeStr, actor, details.take(20).uppercase(), details)
        _auditLogs.value = listOf(newLog) + _auditLogs.value
    }

    fun toggleProOnline(proId: String, online: Boolean) {
        _professionals.value = _professionals.value.map { pro ->
            if (pro.id == proId || pro.userId == proId) {
                pro.copy(isAvailable = online, availableNow = online)
            } else pro
        }
        recordLog("Professional status set to ${if (online) "Online" else "Offline"}", "Worker")
    }

    fun createBooking(
        categoryId: String,
        workerId: String,
        bookingType: String,
        scheduledDate: String,
        scheduledSlot: String,
        address: String,
        locality: String,
        problemDescription: String,
        serviceTitle: String? = null,
        servicePrice: Int? = null
    ): Booking {
        val category = categories.find { it.id == categoryId } ?: categories[0]
        val pro = _professionals.value.find { it.id == workerId } ?: _professionals.value[0]
        val price = servicePrice ?: pro.baseRate
        val platformFee = 15
        val safetyFee = 15
        val finalAmt = price + platformFee + safetyFee

        val ref = "HOM-2026-${(1000..9999).random()}"
        val newBooking = Booking(
            id = "b-${System.currentTimeMillis()}",
            bookingRef = ref,
            customerId = "u-cust-1",
            customerName = "Hanzala Siddiqui",
            customerPhone = "+91 98450 77123",
            workerId = pro.id,
            workerName = pro.name,
            workerTrade = pro.trade,
            workerPhone = pro.phone,
            workerAvatar = pro.avatarUrl,
            categoryId = category.id,
            serviceTitle = serviceTitle ?: "${category.name} Inspection & Fix",
            servicePrice = price,
            inspectionFee = category.inspectionFee,
            platformFee = platformFee,
            safetyFee = safetyFee,
            bookingType = bookingType,
            scheduledDate = scheduledDate,
            scheduledTimeSlot = scheduledSlot,
            status = if (bookingType == "instant") "pro_assigned" else "scheduled_confirmed",
            statusHistory = listOf(
                StatusHistoryItem("requested", "Just now", "Customer", "Booking created"),
                StatusHistoryItem("pro_assigned", "Just now", "System", "${pro.name} assigned to dispatch")
            ),
            addressFormatted = address,
            locality = locality,
            city = "Lucknow",
            problemDescription = problemDescription,
            pricingSummary = PricingSummary(baseQuote = price, finalAmount = finalAmt),
            messages = listOf(
                BookingMessage("m-init", "system", "System", "Booking confirmed with ${pro.name}.", "Just now")
            )
        )

        _bookings.value = listOf(newBooking) + _bookings.value
        recordLog("Booking $ref created for ${pro.name}", "Customer")
        return newBooking
    }

    fun advanceBookingStatus(bookingId: String, nextStatus: String, note: String? = null) {
        _bookings.value = _bookings.value.map { b ->
            if (b.id == bookingId) {
                val timeStr = SimpleDateFormat("HH:mm", Locale.getDefault()).format(Date())
                val newHistory = b.statusHistory + StatusHistoryItem(
                    status = nextStatus,
                    timestamp = timeStr,
                    actor = "System",
                    note = note ?: "Status changed to $nextStatus"
                )
                b.copy(status = nextStatus, statusHistory = newHistory)
            } else b
        }
        recordLog("Booking $bookingId transitioned to $nextStatus", "System")
    }

    fun toggleLocationSharing(bookingId: String, role: String, enabled: Boolean) {
        _bookings.value = _bookings.value.map { b ->
            if (b.id == bookingId) {
                val sharing = b.locationSharing
                val updatedSharing = if (role == "customer") {
                    sharing.copy(customerSharing = enabled)
                } else {
                    sharing.copy(workerSharing = enabled, workerLocation = if (enabled) LocationCoordinate(26.8520, 80.9910, "Live") else null)
                }
                b.copy(locationSharing = updatedSharing)
            } else b
        }
    }

    fun sendBookingMessage(bookingId: String, senderRole: String, senderName: String, text: String) {
        val timeStr = SimpleDateFormat("HH:mm", Locale.getDefault()).format(Date())
        val msg = BookingMessage("msg-${System.currentTimeMillis()}", senderRole, senderName, text, timeStr)
        _bookings.value = _bookings.value.map { b ->
            if (b.id == bookingId) {
                b.copy(messages = b.messages + msg)
            } else b
        }
    }

    fun submitOnSiteQuote(bookingId: String, partsCost: Int, laborCost: Int, description: String) {
        val total = partsCost + laborCost
        val timeStr = SimpleDateFormat("HH:mm", Locale.getDefault()).format(Date())
        val quote = OnSiteQuote(
            id = "q-${System.currentTimeMillis()}",
            description = description,
            partsCost = partsCost,
            laborCost = laborCost,
            totalAmount = total,
            items = listOf(QuoteItem(description, 1, total)),
            status = "pending",
            submittedAt = timeStr
        )
        _bookings.value = _bookings.value.map { b ->
            if (b.id == bookingId) {
                val newHistory = b.statusHistory + StatusHistoryItem("quote_submitted", timeStr, b.workerName, "Estimate of ₹$total submitted")
                b.copy(
                    quote = quote,
                    status = "quote_submitted",
                    statusHistory = newHistory
                )
            } else b
        }
        recordLog("Quote of ₹$total submitted for booking $bookingId", "Worker")
    }

    fun respondToQuote(bookingId: String, approved: Boolean, reason: String = "") {
        val timeStr = SimpleDateFormat("HH:mm", Locale.getDefault()).format(Date())
        _bookings.value = _bookings.value.map { b ->
            if (b.id == bookingId && b.quote != null) {
                val updatedQuote = b.quote.copy(status = if (approved) "approved" else "rejected", decisionReason = reason)
                if (approved) {
                    val finalAmt = b.quote.totalAmount + b.platformFee + b.safetyFee
                    val summary = b.pricingSummary.copy(
                        partsCost = b.quote.partsCost,
                        laborCost = b.quote.laborCost,
                        finalAmount = finalAmt
                    )
                    val newHistory = b.statusHistory + StatusHistoryItem("quote_approved", timeStr, b.customerName, "Quote approved: ₹${b.quote.totalAmount}")
                    b.copy(quote = updatedQuote, status = "in_progress", servicePrice = b.quote.totalAmount, pricingSummary = summary, statusHistory = newHistory)
                } else {
                    val newHistory = b.statusHistory + StatusHistoryItem("quote_declined", timeStr, b.customerName, "Quote declined: $reason")
                    b.copy(quote = updatedQuote, status = "on_site", statusHistory = newHistory)
                }
            } else b
        }
    }

    fun processPayment(bookingId: String, method: String, upiApp: String? = null) {
        val timeStr = SimpleDateFormat("HH:mm", Locale.getDefault()).format(Date())
        val txn = "TXN-HOM-${System.currentTimeMillis().toString().takeLast(6)}"
        _bookings.value = _bookings.value.map { b ->
            if (b.id == bookingId) {
                val payment = PaymentInfo(
                    status = "paid",
                    method = method,
                    transactionId = txn,
                    upiApp = upiApp,
                    amount = b.pricingSummary.finalAmount,
                    paidAt = timeStr
                )
                val newHistory = b.statusHistory + StatusHistoryItem("completed", timeStr, "Customer", "Paid ₹${payment.amount} via ${method.uppercase()}")
                b.copy(payment = payment, status = "completed", statusHistory = newHistory)
            } else b
        }
        recordLog("Payment captured for $bookingId via $method", "Customer")
    }

    fun submitRating(bookingId: String, rating: Int, comment: String, punctuality: Int = 5, quality: Int = 5, behavior: Int = 5, pricing: Int = 5) {
        val review = RatingReview(rating, punctuality, quality, behavior, pricing, comment, "Today", "Hanzala")
        _bookings.value = _bookings.value.map { b ->
            if (b.id == bookingId) {
                b.copy(customerRating = review)
            } else b
        }
        recordLog("Rating of $rating★ submitted for booking $bookingId", "Customer")
    }

    fun cancelBooking(bookingId: String, reason: String) {
        val timeStr = SimpleDateFormat("HH:mm", Locale.getDefault()).format(Date())
        _bookings.value = _bookings.value.map { b ->
            if (b.id == bookingId) {
                val newHistory = b.statusHistory + StatusHistoryItem("cancelled", timeStr, "Customer", "Cancelled: $reason")
                b.copy(status = "cancelled_by_customer", statusHistory = newHistory)
            } else b
        }
        recordLog("Booking $bookingId cancelled: $reason", "Customer")
    }

    fun addHomeAsset(name: String, category: String, brand: String, location: String, warrantyStatus: String) {
        val asset = HomeAsset(
            id = "asset-${System.currentTimeMillis()}",
            name = name,
            category = category,
            brand = brand,
            installedDate = "Recently Added",
            locationRoom = location,
            warrantyStatus = warrantyStatus,
            lastServiced = "None",
            servicedByProName = "None",
            nextDueReminderDate = "In 6 months",
            reminderNote = "Initial preventative check",
            status = "healthy"
        )
        _homeAssets.value = listOf(asset) + _homeAssets.value
        recordLog("Added asset $name ($brand)", "Customer")
    }

    fun fileSafetyReport(bookingId: String?, proId: String?, category: String, description: String) {
        val timeStr = SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.getDefault()).format(Date())
        val report = SafetyReport(
            id = "safe-${System.currentTimeMillis()}",
            bookingId = bookingId,
            proId = proId,
            reporterName = "Hanzala Siddiqui",
            reporterPhone = "+91 98450 77123",
            category = category,
            description = description,
            timestamp = timeStr
        )
        _safetyReports.value = listOf(report) + _safetyReports.value
        recordLog("Safety incident reported: $category", "Customer")
    }
}
