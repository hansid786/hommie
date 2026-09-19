package com.example.hommie.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.hommie.data.model.Booking
import com.example.hommie.ui.theme.*

@Composable
fun BookingDetailScreen(
    booking: Booking,
    onBack: () -> Unit,
    onOpenChat: () -> Unit,
    onToggleLocationSharing: (Boolean) -> Unit,
    onApproveQuote: () -> Unit,
    onDeclineQuote: () -> Unit,
    onOpenPayment: () -> Unit,
    onOpenRating: () -> Unit,
    onSafetyReport: () -> Unit,
    onCancelBooking: () -> Unit
) {
    val isCompleted = booking.status == "completed"
    val isCancelled = booking.status == "cancelled_by_customer"
    val isPaid = booking.payment.status == "paid"

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(CanvasBg)
    ) {
        // TopBar
        Surface(
            color = SurfaceWhite,
            shadowElevation = 2.dp
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .statusBarsPadding()
                    .padding(horizontal = 12.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = onBack) {
                    Icon(imageVector = Icons.Default.ArrowBack, contentDescription = "Back", tint = TextPrimary)
                }
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "Booking ${booking.bookingRef}",
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp,
                        color = TextPrimary
                    )
                    Text(
                        text = booking.serviceTitle,
                        fontSize = 11.sp,
                        color = TextSecondary
                    )
                }
                IconButton(onClick = onSafetyReport) {
                    Icon(imageVector = Icons.Default.Shield, contentDescription = "Safety", tint = BrandAccent)
                }
            }
        }

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // 1. Status Indicator & Banner
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = when {
                            isCompleted -> EmeraldLight
                            isCancelled -> RoseLight
                            else -> AmberLight
                        }
                    ),
                    border = BorderStroke(
                        1.dp,
                        when {
                            isCompleted -> Color(0xFFA7F3D0)
                            isCancelled -> Color(0xFFFECDD3)
                            else -> Color(0xFFFDE68A)
                        }
                    )
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "CURRENT STATUS",
                                fontWeight = FontWeight.Bold,
                                fontSize = 10.sp,
                                color = when {
                                    isCompleted -> EmeraldSuccess
                                    isCancelled -> RoseError
                                    else -> BrandAction
                                }
                            )
                            Text(
                                text = booking.scheduledTimeSlot,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = TextPrimary
                            )
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = when (booking.status) {
                                "pro_assigned" -> "Technician Assigned & Preparing"
                                "en_route" -> "Technician En Route with Equipment (~${booking.etaMinutes}m ETA)"
                                "on_site" -> "Technician On-Site Diagnosing Issue"
                                "quote_submitted" -> "Estimate Awaiting Your Approval"
                                "quote_approved", "in_progress" -> "Repair Work In Progress"
                                "completed" -> "Service Successfully Completed"
                                "cancelled_by_customer" -> "Booking Cancelled"
                                else -> booking.status.replace("_", " ").uppercase()
                            },
                            fontWeight = FontWeight.Bold,
                            fontSize = 15.sp,
                            color = TextPrimary
                        )
                    }
                }
            }

            // 2. Assigned Technician Card
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = SurfaceWhite),
                    border = BorderStroke(1.dp, CardBorder)
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            AsyncImage(
                                model = booking.workerAvatar,
                                contentDescription = booking.workerName,
                                modifier = Modifier
                                    .size(52.dp)
                                    .clip(CircleShape),
                                contentScale = ContentScale.Crop
                            )
                            Spacer(modifier = Modifier.width(12.dp))
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = booking.workerName,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 15.sp,
                                    color = TextPrimary
                                )
                                Text(
                                    text = booking.workerTrade,
                                    fontSize = 11.sp,
                                    color = BrandAccent
                                )
                                Spacer(modifier = Modifier.height(2.dp))
                                Text(
                                    text = "Direct Contact: ${booking.workerPhone}",
                                    fontSize = 10.sp,
                                    color = TextSecondary
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(12.dp))
                        Divider(color = CardBorder, thickness = 0.5.dp)
                        Spacer(modifier = Modifier.height(10.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            OutlinedButton(
                                onClick = onOpenChat,
                                modifier = Modifier
                                    .weight(1f)
                                    .testTag("booking_chat_btn"),
                                shape = RoundedCornerShape(8.dp),
                                contentPadding = PaddingValues(vertical = 8.dp)
                            ) {
                                Icon(imageVector = Icons.Default.Chat, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("In-App Chat", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                            }

                            Button(
                                onClick = { /* Direct phone intent simulation */ },
                                modifier = Modifier.weight(1f),
                                colors = ButtonDefaults.buttonColors(containerColor = BrandPrimary),
                                shape = RoundedCornerShape(8.dp),
                                contentPadding = PaddingValues(vertical = 8.dp)
                            ) {
                                Icon(imageVector = Icons.Default.Phone, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("Call Pro", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }

            // 3. Live Technician GPS Tracking Card
            if (!isCompleted && !isCancelled) {
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(14.dp),
                        colors = CardDefaults.cardColors(containerColor = SurfaceWhite),
                        border = BorderStroke(1.dp, CardBorder)
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(imageVector = Icons.Default.Navigation, contentDescription = null, tint = BrandAction, modifier = Modifier.size(18.dp))
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text("Live Technician GPS Tracker", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = TextPrimary)
                                }
                                Text("Active", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = EmeraldSuccess)
                            }

                            Spacer(modifier = Modifier.height(10.dp))

                            // Simulated Visual Map Route
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(100.dp)
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(Color(0xFFE2E8F0)),
                                contentAlignment = Alignment.Center
                            ) {
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Icon(imageVector = Icons.Default.TwoWheeler, contentDescription = null, tint = BrandPrimary, modifier = Modifier.size(32.dp))
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text("En route via Gomti Nagar Bypass", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = TextPrimary)
                                    Text("Technician Coordinates: 26.8520° N, 80.9910° E", fontSize = 9.sp, color = TextSecondary)
                                }
                            }

                            Spacer(modifier = Modifier.height(10.dp))

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text("Share My Exact Location with Pro", fontSize = 11.sp, color = TextPrimary)
                                Switch(
                                    checked = booking.locationSharing.customerSharing,
                                    onCheckedChange = onToggleLocationSharing,
                                    modifier = Modifier.testTag("location_share_switch")
                                )
                            }
                        }
                    }
                }
            }

            // 4. On-Site Quote Review (if submitted)
            if (booking.quote != null && booking.quote.status == "pending") {
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(14.dp),
                        colors = CardDefaults.cardColors(containerColor = AmberLight),
                        border = BorderStroke(1.dp, Color(0xFFFDE68A))
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(imageVector = Icons.Default.Receipt, contentDescription = null, tint = BrandAction, modifier = Modifier.size(18.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("On-Site Estimate Submitted by ${booking.workerName}", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = Color(0xFF92400E))
                            }
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(text = "Job: ${booking.quote.description}", fontSize = 12.sp, color = TextPrimary)
                            Spacer(modifier = Modifier.height(6.dp))
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text("Parts & Materials:", fontSize = 11.sp, color = TextSecondary)
                                Text("₹${booking.quote.partsCost}", fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
                            }
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text("Labor & Diagnostic:", fontSize = 11.sp, color = TextSecondary)
                                Text("₹${booking.quote.laborCost}", fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
                            }
                            Spacer(modifier = Modifier.height(4.dp))
                            Divider(color = Color(0xFFFDE68A))
                            Spacer(modifier = Modifier.height(4.dp))
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text("Total Estimated:", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = Color(0xFF92400E))
                                Text("₹${booking.quote.totalAmount}", fontWeight = FontWeight.ExtraBold, fontSize = 15.sp, color = Color(0xFF92400E))
                            }

                            Spacer(modifier = Modifier.height(12.dp))

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                OutlinedButton(
                                    onClick = onDeclineQuote,
                                    modifier = Modifier.weight(1f),
                                    shape = RoundedCornerShape(8.dp)
                                ) {
                                    Text("Decline", fontSize = 11.sp)
                                }
                                Button(
                                    onClick = onApproveQuote,
                                    modifier = Modifier
                                        .weight(1.5f)
                                        .testTag("approve_quote_btn"),
                                    colors = ButtonDefaults.buttonColors(containerColor = BrandAction),
                                    shape = RoundedCornerShape(8.dp)
                                ) {
                                    Text("Approve & Start Work", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }
                }
            }

            // 5. Payment Action (if completed)
            if (isCompleted) {
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(14.dp),
                        colors = CardDefaults.cardColors(containerColor = SurfaceWhite),
                        border = BorderStroke(1.dp, CardBorder)
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text("Service Settlement", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = TextPrimary)
                                if (isPaid) {
                                    Text("PAID ✓", fontWeight = FontWeight.ExtraBold, fontSize = 11.sp, color = EmeraldSuccess)
                                } else {
                                    Text("PAYMENT DUE", fontWeight = FontWeight.Bold, fontSize = 10.sp, color = RoseError)
                                }
                            }
                            Spacer(modifier = Modifier.height(8.dp))
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text("Total Final Bill:", fontSize = 12.sp, color = TextSecondary)
                                Text("₹${booking.pricingSummary.finalAmount}", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = BrandPrimary)
                            }
                            if (isPaid) {
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = "Paid via ${booking.payment.method?.uppercase() ?: "UPI"} (${booking.payment.transactionId ?: "TXN-OK"})",
                                    fontSize = 10.sp,
                                    color = EmeraldSuccess
                                )
                            } else {
                                Spacer(modifier = Modifier.height(10.dp))
                                Button(
                                    onClick = onOpenPayment,
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .testTag("pay_bill_btn"),
                                    colors = ButtonDefaults.buttonColors(containerColor = EmeraldSuccess),
                                    shape = RoundedCornerShape(8.dp)
                                ) {
                                    Icon(imageVector = Icons.Default.QrCode, contentDescription = null, modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text("Pay ₹${booking.pricingSummary.finalAmount} via UPI / Cash", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                                }
                            }
                        }
                    }
                }

                // 6. Rating & Review
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(14.dp),
                        colors = CardDefaults.cardColors(containerColor = SurfaceWhite),
                        border = BorderStroke(1.dp, CardBorder)
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Text("Rate Experience with ${booking.workerName}", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = TextPrimary)
                            Spacer(modifier = Modifier.height(6.dp))
                            if (booking.customerRating != null) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    repeat(booking.customerRating.rating) {
                                        Icon(imageVector = Icons.Default.Star, contentDescription = null, tint = BrandAction, modifier = Modifier.size(16.dp))
                                    }
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text(text = "Reviewed: \"${booking.customerRating.comment}\"", fontSize = 11.sp, color = TextSecondary)
                                }
                            } else {
                                OutlinedButton(
                                    onClick = onOpenRating,
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .testTag("rate_pro_btn"),
                                    shape = RoundedCornerShape(8.dp)
                                ) {
                                    Icon(imageVector = Icons.Default.StarBorder, contentDescription = null, modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text("Leave 5-Star Review for Arjun", fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
                                }
                            }
                        }
                    }
                }
            }

            // Cancel action if not finished
            if (!isCompleted && !isCancelled) {
                item {
                    TextButton(
                        onClick = onCancelBooking,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("Cancel Booking Request", color = RoseError, fontSize = 12.sp)
                    }
                }
            }
        }
    }
}
