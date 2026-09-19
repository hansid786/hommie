package com.example.hommie.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.hommie.data.model.*
import com.example.hommie.data.repository.HommieRepository
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

enum class AppDestination {
    HOME,
    DISCOVERY,
    BOOKINGS,
    MY_HOME,
    PRO_PORTAL,
    ADMIN
}

data class HommieUiState(
    val currentDestination: AppDestination = AppDestination.HOME,
    val currentRole: UserRole = UserRole.CUSTOMER,
    val activeLocality: Locality? = null,
    val searchQuery: String = "",
    val selectedCategorySlug: String? = null,
    val availableNowOnly: Boolean = false,
    val verifiedOnly: Boolean = false,
    val minRating: Double = 0.0,
    val selectedPro: Professional? = null,
    val bookingPro: Professional? = null,
    val activeBookingDetail: Booking? = null,
    val showLocationDialog: Boolean = false,
    val showBookingDialog: Boolean = false,
    val showQuoteDialog: Boolean = false,
    val showPaymentDialog: Boolean = false,
    val showRatingDialog: Boolean = false,
    val showSafetyDialog: Boolean = false,
    val showAddAssetDialog: Boolean = false,
    val showChatScreen: Boolean = false,
    val initialBookingUrgent: Boolean = false,
    val activeChatBookingId: String? = null
)

class HommieViewModel(
    private val repository: HommieRepository = HommieRepository()
) : ViewModel() {

    val activeLocality: StateFlow<Locality> = repository.activeLocality
    val categories = repository.categories
    val cities = repository.cities
    val professionals: StateFlow<List<Professional>> = repository.professionals
    val bookings: StateFlow<List<Booking>> = repository.bookings
    val homeAssets: StateFlow<List<HomeAsset>> = repository.homeAssets
    val auditLogs: StateFlow<List<AuditLog>> = repository.auditLogs
    val safetyReports: StateFlow<List<SafetyReport>> = repository.safetyReports

    private val _uiState = MutableStateFlow(HommieUiState())
    val uiState: StateFlow<HommieUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            repository.activeLocality.collect { loc ->
                _uiState.update { it.copy(activeLocality = loc) }
            }
        }
    }

    fun setDestination(destination: AppDestination) {
        _uiState.update { it.copy(currentDestination = destination, showChatScreen = false) }
    }

    fun switchRole(role: UserRole) {
        _uiState.update { state ->
            val nextDest = when (role) {
                UserRole.CUSTOMER -> AppDestination.HOME
                UserRole.WORKER -> AppDestination.PRO_PORTAL
                UserRole.ADMIN -> AppDestination.ADMIN
            }
            state.copy(currentRole = role, currentDestination = nextDest)
        }
    }

    fun setLocality(locality: Locality) {
        repository.setLocality(locality)
        _uiState.update { it.copy(showLocationDialog = false) }
    }

    fun setSearchQuery(query: String) {
        _uiState.update { it.copy(searchQuery = query) }
    }

    fun selectCategory(slug: String?) {
        _uiState.update {
            it.copy(
                selectedCategorySlug = if (it.selectedCategorySlug == slug) null else slug
            )
        }
    }

    fun toggleAvailableNowOnly() {
        _uiState.update { it.copy(availableNowOnly = !it.availableNowOnly) }
    }

    fun toggleVerifiedOnly() {
        _uiState.update { it.copy(verifiedOnly = !it.verifiedOnly) }
    }

    fun setMinRating(rating: Double) {
        _uiState.update { it.copy(minRating = if (it.minRating == rating) 0.0 else rating) }
    }

    fun openProProfile(pro: Professional) {
        _uiState.update { it.copy(selectedPro = pro) }
    }

    fun closeProProfile() {
        _uiState.update { it.copy(selectedPro = null) }
    }

    fun startBooking(pro: Professional, urgent: Boolean = false) {
        _uiState.update {
            it.copy(
                bookingPro = pro,
                showBookingDialog = true,
                initialBookingUrgent = urgent
            )
        }
    }

    fun closeBookingDialog() {
        _uiState.update { it.copy(showBookingDialog = false, bookingPro = null) }
    }

    fun confirmBooking(
        categoryId: String,
        workerId: String,
        bookingType: String,
        scheduledDate: String,
        scheduledSlot: String,
        address: String,
        locality: String,
        notes: String
    ) {
        val booking = repository.createBooking(
            categoryId = categoryId,
            workerId = workerId,
            bookingType = bookingType,
            scheduledDate = scheduledDate,
            scheduledSlot = scheduledSlot,
            address = address,
            locality = locality,
            problemDescription = notes
        )
        _uiState.update {
            it.copy(
                showBookingDialog = false,
                bookingPro = null,
                activeBookingDetail = booking,
                currentDestination = AppDestination.BOOKINGS
            )
        }
    }

    fun selectBookingDetail(booking: Booking) {
        _uiState.update { it.copy(activeBookingDetail = booking) }
    }

    fun closeBookingDetail() {
        _uiState.update { it.copy(activeBookingDetail = null) }
    }

    fun openChat(bookingId: String) {
        _uiState.update { it.copy(showChatScreen = true, activeChatBookingId = bookingId) }
    }

    fun closeChat() {
        _uiState.update { it.copy(showChatScreen = false, activeChatBookingId = null) }
    }

    fun sendMessage(bookingId: String, text: String) {
        val isWorker = _uiState.value.currentRole == UserRole.WORKER
        val role = if (isWorker) "worker" else "customer"
        val name = if (isWorker) "Arjun Singh" else "Hanzala Siddiqui"
        repository.sendBookingMessage(bookingId, role, name, text)
    }

    fun toggleLocationSharing(bookingId: String, role: String, enabled: Boolean) {
        repository.toggleLocationSharing(bookingId, role, enabled)
    }

    fun advanceBooking(bookingId: String, nextStatus: String, note: String? = null) {
        repository.advanceBookingStatus(bookingId, nextStatus, note)
    }

    fun submitOnSiteQuote(bookingId: String, parts: Int, labor: Int, description: String) {
        repository.submitOnSiteQuote(bookingId, parts, labor, description)
        _uiState.update { it.copy(showQuoteDialog = false) }
    }

    fun respondToQuote(bookingId: String, approved: Boolean, reason: String = "") {
        repository.respondToQuote(bookingId, approved, reason)
    }

    fun processPayment(bookingId: String, method: String, upiApp: String? = null) {
        repository.processPayment(bookingId, method, upiApp)
        _uiState.update { it.copy(showPaymentDialog = false) }
    }

    fun submitRating(bookingId: String, rating: Int, comment: String) {
        repository.submitRating(bookingId, rating, comment)
        _uiState.update { it.copy(showRatingDialog = false) }
    }

    fun cancelBooking(bookingId: String, reason: String) {
        repository.cancelBooking(bookingId, reason)
    }

    fun addHomeAsset(name: String, category: String, brand: String, room: String, warranty: String) {
        repository.addHomeAsset(name, category, brand, room, warranty)
        _uiState.update { it.copy(showAddAssetDialog = false) }
    }

    fun fileSafetyReport(bookingId: String?, proId: String?, category: String, description: String) {
        repository.fileSafetyReport(bookingId, proId, category, description)
        _uiState.update { it.copy(showSafetyDialog = false) }
    }

    fun toggleWorkerOnline(proId: String, online: Boolean) {
        repository.toggleProOnline(proId, online)
    }

    fun setShowLocationDialog(show: Boolean) {
        _uiState.update { it.copy(showLocationDialog = show) }
    }

    fun setShowQuoteDialog(show: Boolean) {
        _uiState.update { it.copy(showQuoteDialog = show) }
    }

    fun setShowPaymentDialog(show: Boolean) {
        _uiState.update { it.copy(showPaymentDialog = show) }
    }

    fun setShowRatingDialog(show: Boolean) {
        _uiState.update { it.copy(showRatingDialog = show) }
    }

    fun setShowSafetyDialog(show: Boolean) {
        _uiState.update { it.copy(showSafetyDialog = show) }
    }

    fun setShowAddAssetDialog(show: Boolean) {
        _uiState.update { it.copy(showAddAssetDialog = show) }
    }
}
