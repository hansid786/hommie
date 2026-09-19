package com.example.hommie

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.hommie.data.model.UserRole
import com.example.hommie.ui.components.LocalityTopBar
import com.example.hommie.ui.screens.*
import com.example.hommie.ui.theme.BrandAction
import com.example.hommie.ui.theme.BrandPrimary
import com.example.hommie.ui.theme.HOMMIETheme
import com.example.hommie.ui.theme.SurfaceWhite
import com.example.hommie.ui.viewmodel.AppDestination
import com.example.hommie.ui.viewmodel.HommieViewModel

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            HOMMIETheme {
                val viewModel: HommieViewModel = viewModel()
                val uiState by viewModel.uiState.collectAsState()
                val professionals by viewModel.professionals.collectAsState()
                val bookings by viewModel.bookings.collectAsState()
                val homeAssets by viewModel.homeAssets.collectAsState()
                val auditLogs by viewModel.auditLogs.collectAsState()
                val safetyReports by viewModel.safetyReports.collectAsState()
                val activeLocality by viewModel.activeLocality.collectAsState()

                Scaffold(
                    topBar = {
                        if (!uiState.showChatScreen && uiState.activeBookingDetail == null) {
                            LocalityTopBar(
                                activeLocality = activeLocality,
                                currentRole = uiState.currentRole,
                                onLocationClick = { viewModel.setShowLocationDialog(true) },
                                onRoleClick = {
                                    val nextRole = when (uiState.currentRole) {
                                        UserRole.CUSTOMER -> UserRole.WORKER
                                        UserRole.WORKER -> UserRole.ADMIN
                                        UserRole.ADMIN -> UserRole.CUSTOMER
                                    }
                                    viewModel.switchRole(nextRole)
                                },
                                onSafetyClick = { viewModel.setShowSafetyDialog(true) }
                            )
                        }
                    },
                    bottomBar = {
                        if (!uiState.showChatScreen && uiState.activeBookingDetail == null) {
                            NavigationBar(
                                containerColor = SurfaceWhite,
                                tonalElevation = 8.dp,
                                modifier = Modifier.testTag("main_bottom_nav")
                            ) {
                                when (uiState.currentRole) {
                                    UserRole.CUSTOMER -> {
                                        NavigationBarItem(
                                            selected = uiState.currentDestination == AppDestination.HOME,
                                            onClick = { viewModel.setDestination(AppDestination.HOME) },
                                            icon = { Icon(imageVector = Icons.Default.Home, contentDescription = "Home") },
                                            label = { Text("Home", fontSize = 10.sp) },
                                            colors = NavigationBarItemDefaults.colors(
                                                selectedIconColor = BrandPrimary,
                                                indicatorColor = Color(0xFFE2E8F0)
                                            )
                                        )
                                        NavigationBarItem(
                                            selected = uiState.currentDestination == AppDestination.DISCOVERY,
                                            onClick = { viewModel.setDestination(AppDestination.DISCOVERY) },
                                            icon = { Icon(imageVector = Icons.Default.Search, contentDescription = "Find Pros") },
                                            label = { Text("Find Pros", fontSize = 10.sp) },
                                            colors = NavigationBarItemDefaults.colors(
                                                selectedIconColor = BrandPrimary,
                                                indicatorColor = Color(0xFFE2E8F0)
                                            )
                                        )
                                        NavigationBarItem(
                                            selected = uiState.currentDestination == AppDestination.BOOKINGS,
                                            onClick = { viewModel.setDestination(AppDestination.BOOKINGS) },
                                            icon = { Icon(imageVector = Icons.Default.ConfirmationNumber, contentDescription = "Bookings") },
                                            label = { Text("Bookings", fontSize = 10.sp) },
                                            colors = NavigationBarItemDefaults.colors(
                                                selectedIconColor = BrandPrimary,
                                                indicatorColor = Color(0xFFE2E8F0)
                                            )
                                        )
                                        NavigationBarItem(
                                            selected = uiState.currentDestination == AppDestination.MY_HOME,
                                            onClick = { viewModel.setDestination(AppDestination.MY_HOME) },
                                            icon = { Icon(imageVector = Icons.Default.HomeRepairService, contentDescription = "My Home") },
                                            label = { Text("My Home", fontSize = 10.sp) },
                                            colors = NavigationBarItemDefaults.colors(
                                                selectedIconColor = BrandPrimary,
                                                indicatorColor = Color(0xFFE2E8F0)
                                            )
                                        )
                                    }
                                    UserRole.WORKER -> {
                                        NavigationBarItem(
                                            selected = uiState.currentDestination == AppDestination.PRO_PORTAL,
                                            onClick = { viewModel.setDestination(AppDestination.PRO_PORTAL) },
                                            icon = { Icon(imageVector = Icons.Default.Build, contentDescription = "Pro Hub") },
                                            label = { Text("Pro Hub", fontSize = 10.sp) },
                                            colors = NavigationBarItemDefaults.colors(
                                                selectedIconColor = BrandAction,
                                                indicatorColor = Color(0xFFFEF3C7)
                                            )
                                        )
                                        NavigationBarItem(
                                            selected = false,
                                            onClick = { viewModel.switchRole(UserRole.CUSTOMER) },
                                            icon = { Icon(imageVector = Icons.Default.Person, contentDescription = "Customer View") },
                                            label = { Text("Customer View", fontSize = 10.sp) }
                                        )
                                    }
                                    UserRole.ADMIN -> {
                                        NavigationBarItem(
                                            selected = uiState.currentDestination == AppDestination.ADMIN,
                                            onClick = { viewModel.setDestination(AppDestination.ADMIN) },
                                            icon = { Icon(imageVector = Icons.Default.AdminPanelSettings, contentDescription = "Admin") },
                                            label = { Text("Admin Control", fontSize = 10.sp) }
                                        )
                                        NavigationBarItem(
                                            selected = false,
                                            onClick = { viewModel.switchRole(UserRole.CUSTOMER) },
                                            icon = { Icon(imageVector = Icons.Default.Person, contentDescription = "Customer View") },
                                            label = { Text("Customer View", fontSize = 10.sp) }
                                        )
                                    }
                                }
                            }
                        }
                    }
                ) { innerPadding ->
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(innerPadding)
                    ) {
                        // 1. Navigation routing
                        when {
                            uiState.showChatScreen && uiState.activeChatBookingId != null -> {
                                val chatBooking = bookings.find { it.id == uiState.activeChatBookingId }
                                if (chatBooking != null) {
                                    ChatScreen(
                                        booking = chatBooking,
                                        onBack = { viewModel.closeChat() },
                                        onSendMessage = { text -> viewModel.sendMessage(chatBooking.id, text) }
                                    )
                                }
                            }
                            uiState.activeBookingDetail != null -> {
                                val currentDetail = bookings.find { it.id == uiState.activeBookingDetail?.id } ?: uiState.activeBookingDetail!!
                                BookingDetailScreen(
                                    booking = currentDetail,
                                    onBack = { viewModel.closeBookingDetail() },
                                    onOpenChat = { viewModel.openChat(currentDetail.id) },
                                    onToggleLocationSharing = { enabled -> viewModel.toggleLocationSharing(currentDetail.id, "customer", enabled) },
                                    onApproveQuote = { viewModel.respondToQuote(currentDetail.id, true) },
                                    onDeclineQuote = { viewModel.respondToQuote(currentDetail.id, false, "Price too high") },
                                    onOpenPayment = { viewModel.setShowPaymentDialog(true) },
                                    onOpenRating = { viewModel.setShowRatingDialog(true) },
                                    onSafetyReport = { viewModel.setShowSafetyDialog(true) },
                                    onCancelBooking = { viewModel.cancelBooking(currentDetail.id, "Customer requested cancellation") }
                                )
                            }
                            else -> {
                                when (uiState.currentDestination) {
                                    AppDestination.HOME -> {
                                        HomeScreen(
                                            activeLocality = activeLocality,
                                            categories = viewModel.categories,
                                            professionals = professionals,
                                            activeBookings = bookings,
                                            onCategoryClick = { cat ->
                                                viewModel.selectCategory(cat.slug)
                                                viewModel.setDestination(AppDestination.DISCOVERY)
                                            },
                                            onProClick = { pro -> viewModel.openProProfile(pro) },
                                            onBookProClick = { pro -> viewModel.startBooking(pro) },
                                            onUrgentDispatchClick = {
                                                val topPro = professionals.firstOrNull { it.isAvailable && it.availableNow } ?: professionals[0]
                                                viewModel.startBooking(topPro, urgent = true)
                                            },
                                            onActiveBookingClick = { b -> viewModel.selectBookingDetail(b) },
                                            onViewAllProsClick = { viewModel.setDestination(AppDestination.DISCOVERY) }
                                        )
                                    }
                                    AppDestination.DISCOVERY -> {
                                        DiscoveryScreen(
                                            professionals = professionals,
                                            categories = viewModel.categories,
                                            selectedCategorySlug = uiState.selectedCategorySlug,
                                            searchQuery = uiState.searchQuery,
                                            availableNowOnly = uiState.availableNowOnly,
                                            verifiedOnly = uiState.verifiedOnly,
                                            minRating = uiState.minRating,
                                            onSearchChange = { viewModel.setSearchQuery(it) },
                                            onCategorySelect = { viewModel.selectCategory(it) },
                                            onToggleAvailableNow = { viewModel.toggleAvailableNowOnly() },
                                            onToggleVerifiedOnly = { viewModel.toggleVerifiedOnly() },
                                            onSetMinRating = { viewModel.setMinRating(it) },
                                            onProClick = { pro -> viewModel.openProProfile(pro) },
                                            onBookProClick = { pro -> viewModel.startBooking(pro) }
                                        )
                                    }
                                    AppDestination.BOOKINGS -> {
                                        CustomerBookingsScreen(
                                            bookings = bookings,
                                            onSelectBooking = { b -> viewModel.selectBookingDetail(b) }
                                        )
                                    }
                                    AppDestination.MY_HOME -> {
                                        MyHomeAssetsScreen(
                                            assets = homeAssets,
                                            onAddAssetClick = { viewModel.setShowAddAssetDialog(true) },
                                            onBookServiceForAsset = { asset ->
                                                val matchedPro = professionals.find { it.categoryIds.contains(asset.category) } ?: professionals[0]
                                                viewModel.startBooking(matchedPro)
                                            }
                                        )
                                    }
                                    AppDestination.PRO_PORTAL -> {
                                        val workerPro = professionals.find { it.id == "pro-arjun" } ?: professionals[0]
                                        ProfessionalPortalScreen(
                                            pro = workerPro,
                                            bookings = bookings,
                                            onToggleOnline = { online -> viewModel.toggleWorkerOnline(workerPro.id, online) },
                                            onAdvanceStatus = { bId, nextStatus, note -> viewModel.advanceBooking(bId, nextStatus, note) },
                                            onSubmitQuoteClick = { job ->
                                                viewModel.selectBookingDetail(job)
                                                viewModel.setShowQuoteDialog(true)
                                            },
                                            onOpenChat = { job -> viewModel.openChat(job.id) }
                                        )
                                    }
                                    AppDestination.ADMIN -> {
                                        AdminPortalScreen(
                                            bookings = bookings,
                                            professionals = professionals,
                                            auditLogs = auditLogs,
                                            safetyReports = safetyReports
                                        )
                                    }
                                }
                            }
                        }

                        // 2. Modals & Overlays
                        if (uiState.selectedPro != null) {
                            ProProfileSheet(
                                pro = uiState.selectedPro!!,
                                onDismiss = { viewModel.closeProProfile() },
                                onBookClick = { pro ->
                                    viewModel.closeProProfile()
                                    viewModel.startBooking(pro)
                                }
                            )
                        }

                        if (uiState.showBookingDialog && uiState.bookingPro != null) {
                            BookingModal(
                                pro = uiState.bookingPro!!,
                                activeLocality = activeLocality,
                                initialUrgent = uiState.initialBookingUrgent,
                                onDismiss = { viewModel.closeBookingDialog() },
                                onConfirm = { catId, workerId, type, date, slot, addr, loc, notes ->
                                    viewModel.confirmBooking(catId, workerId, type, date, slot, addr, loc, notes)
                                }
                            )
                        }

                        if (uiState.showLocationDialog) {
                            LocationSelectorDialog(
                                currentLocality = activeLocality,
                                localities = viewModel.cities[0].localities,
                                onSelectLocality = { loc -> viewModel.setLocality(loc) },
                                onDismiss = { viewModel.setShowLocationDialog(false) }
                            )
                        }

                        if (uiState.showPaymentDialog && uiState.activeBookingDetail != null) {
                            val activeB = bookings.find { it.id == uiState.activeBookingDetail?.id } ?: uiState.activeBookingDetail!!
                            PaymentModal(
                                booking = activeB,
                                onDismiss = { viewModel.setShowPaymentDialog(false) },
                                onPay = { method, app -> viewModel.processPayment(activeB.id, method, app) }
                            )
                        }

                        if (uiState.showRatingDialog && uiState.activeBookingDetail != null) {
                            val activeB = bookings.find { it.id == uiState.activeBookingDetail?.id } ?: uiState.activeBookingDetail!!
                            RatingModal(
                                booking = activeB,
                                onDismiss = { viewModel.setShowRatingDialog(false) },
                                onSubmit = { rating, comment -> viewModel.submitRating(activeB.id, rating, comment) }
                            )
                        }

                        if (uiState.showSafetyDialog) {
                            SafetyReportModal(
                                booking = uiState.activeBookingDetail,
                                onDismiss = { viewModel.setShowSafetyDialog(false) },
                                onSubmit = { cat, desc ->
                                    viewModel.fileSafetyReport(uiState.activeBookingDetail?.id, uiState.activeBookingDetail?.workerId, cat, desc)
                                }
                            )
                        }

                        if (uiState.showAddAssetDialog) {
                            AddAssetModal(
                                onDismiss = { viewModel.setShowAddAssetDialog(false) },
                                onAdd = { name, cat, brand, room, warranty ->
                                    viewModel.addHomeAsset(name, cat, brand, room, warranty)
                                }
                            )
                        }

                        if (uiState.showQuoteDialog && uiState.activeBookingDetail != null) {
                            val activeB = bookings.find { it.id == uiState.activeBookingDetail?.id } ?: uiState.activeBookingDetail!!
                            SubmitQuoteModal(
                                booking = activeB,
                                onDismiss = { viewModel.setShowQuoteDialog(false) },
                                onSubmit = { parts, labor, desc ->
                                    viewModel.submitOnSiteQuote(activeB.id, parts, labor, desc)
                                }
                            )
                        }
                    }
                }
            }
        }
    }
}
