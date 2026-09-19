package com.example.hommie.data.model

enum class UserRole {
    CUSTOMER,
    WORKER,
    ADMIN
}

data class Locality(
    val id: String,
    val name: String,
    val pincode: String,
    val active: Boolean = true,
    val supportedCategories: List<String> = emptyList(),
    val lat: Double = 26.8500,
    val lng: Double = 80.9950
)

data class City(
    val id: String,
    val name: String,
    val state: String,
    val active: Boolean = true,
    val localities: List<Locality>
)

data class ServiceItem(
    val id: String,
    val name: String,
    val timeEst: String,
    val price: Int,
    val pricingType: String // "fixed", "starting", "inspection"
)

data class Category(
    val id: String,
    val slug: String,
    val name: String,
    val shortName: String,
    val iconName: String,
    val colorHex: String,
    val badge: String,
    val headline: String,
    val inspectionFee: Int,
    val startingPrice: Int,
    val urgentAvailable: Boolean,
    val services: List<ServiceItem>
)

data class VerificationStatus(
    val phoneVerified: Boolean = true,
    val identityDocumentSubmitted: Boolean = true,
    val backgroundCheckCompleted: Boolean = true,
    val addressVerified: Boolean = true,
    val hommieVerified: Boolean = true
)

data class PayoutBank(
    val accountHolder: String,
    val accountMasked: String,
    val ifsc: String,
    val upiId: String
)

data class PortfolioItem(
    val id: String,
    val title: String,
    val imageUrl: String
)

data class Review(
    val id: String,
    val customerName: String,
    val rating: Int,
    val date: String,
    val comment: String,
    val service: String
)

data class Professional(
    val id: String,
    val userId: String,
    val name: String,
    val trade: String,
    val categoryIds: List<String>,
    val avatarUrl: String,
    val headline: String,
    val about: String,
    val phone: String,
    val email: String,
    val city: String,
    val primaryLocality: String,
    val serviceLocalities: List<String>,
    val serviceRadiusKm: Int,
    val languages: List<String>,
    val experienceYears: Int,
    val baseRate: Int,
    val inspectionFee: Int,
    val pricingModel: String,
    val isAvailable: Boolean = true,
    val availableNow: Boolean = true,
    val earliestArrivalMins: Int = 20,
    val ratingAvg: Double = 4.9,
    val ratingCount: Int = 100,
    val jobsCompleted: Int = 250,
    val responseRatePercent: Int = 98,
    val avgResponseMinutes: Int = 5,
    val repeatCustomerCount: Int = 30,
    val verifications: VerificationStatus = VerificationStatus(),
    val kycStatus: String = "verified",
    val payoutBank: PayoutBank? = null,
    val portfolio: List<PortfolioItem> = emptyList(),
    val reviews: List<Review> = emptyList()
)

data class StatusHistoryItem(
    val status: String,
    val timestamp: String,
    val actor: String,
    val note: String
)

data class BookingMessage(
    val id: String,
    val senderRole: String, // "customer", "worker", "system"
    val senderName: String,
    val text: String,
    val timestamp: String
)

data class QuoteItem(
    val description: String,
    val qty: Int = 1,
    val rate: Int
)

data class OnSiteQuote(
    val id: String,
    val description: String,
    val partsCost: Int,
    val laborCost: Int,
    val totalAmount: Int,
    val items: List<QuoteItem>,
    val status: String, // "pending", "approved", "rejected"
    val submittedAt: String,
    val decisionReason: String = ""
)

data class PricingSummary(
    val baseQuote: Int,
    val partsCost: Int = 0,
    val laborCost: Int = 0,
    val platformFee: Int = 15,
    val safetyFee: Int = 15,
    val totalTax: Int = 0,
    val discount: Int = 0,
    val finalAmount: Int
)

data class PaymentInfo(
    val status: String, // "unpaid", "paid"
    val method: String? = null, // "upi", "card", "cash"
    val transactionId: String? = null,
    val upiApp: String? = null,
    val amount: Int = 0,
    val paidAt: String? = null
)

data class RatingReview(
    val rating: Int,
    val punctuality: Int = 5,
    val quality: Int = 5,
    val behavior: Int = 5,
    val pricing: Int = 5,
    val comment: String,
    val date: String = "Today",
    val customerName: String = "",
    val serviceRendered: String = ""
)

data class LocationCoordinate(
    val lat: Double,
    val lng: Double,
    val updatedAt: String = ""
)

data class LocationSharingState(
    val customerSharing: Boolean = false,
    val workerSharing: Boolean = false,
    val customerLocation: LocationCoordinate? = null,
    val workerLocation: LocationCoordinate? = null
)

data class Booking(
    val id: String,
    val bookingRef: String,
    val customerId: String,
    val customerName: String,
    val customerPhone: String,
    val workerId: String,
    val workerName: String,
    val workerTrade: String,
    val workerPhone: String,
    val workerAvatar: String,
    val categoryId: String,
    val serviceTitle: String,
    val servicePrice: Int,
    val inspectionFee: Int,
    val platformFee: Int = 15,
    val safetyFee: Int = 15,
    val bookingType: String = "instant", // "instant" or "scheduled"
    val scheduledDate: String = "Today",
    val scheduledTimeSlot: String = "Within 30 mins",
    val urgencyLevel: String = "standard",
    val status: String, // "pro_assigned", "en_route", "on_site", "quote_submitted", "quote_approved", "in_progress", "completed", "cancelled_by_customer"
    val statusHistory: List<StatusHistoryItem> = emptyList(),
    val addressFormatted: String,
    val locality: String,
    val city: String,
    val problemDescription: String,
    val pricingSummary: PricingSummary,
    val quote: OnSiteQuote? = null,
    val payment: PaymentInfo = PaymentInfo(status = "unpaid"),
    val customerRating: RatingReview? = null,
    val locationSharing: LocationSharingState = LocationSharingState(),
    val messages: List<BookingMessage> = emptyList(),
    val createdAt: String = "Just now",
    val etaMinutes: Int = 18
)

data class AssetServiceEntry(
    val date: String,
    val type: String,
    val cost: Int,
    val pro: String,
    val invoiceRef: String
)

data class HomeAsset(
    val id: String,
    val name: String,
    val category: String,
    val brand: String,
    val installedDate: String,
    val locationRoom: String,
    val warrantyStatus: String,
    val lastServiced: String,
    val servicedByProName: String,
    val serviceFrequencyMonths: Int = 6,
    val nextDueReminderDate: String,
    val reminderNote: String,
    val status: String = "healthy", // "healthy", "due_soon", "attention"
    val history: List<AssetServiceEntry> = emptyList()
)

data class AuditLog(
    val id: String,
    val timestamp: String,
    val actor: String,
    val action: String,
    val details: String
)

data class SafetyReport(
    val id: String,
    val bookingId: String? = null,
    val proId: String? = null,
    val reporterName: String,
    val reporterPhone: String,
    val category: String,
    val description: String,
    val timestamp: String,
    val status: String = "investigating"
)
