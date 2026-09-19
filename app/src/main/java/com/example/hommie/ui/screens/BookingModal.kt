package com.example.hommie.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
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
import com.example.hommie.data.model.Locality
import com.example.hommie.data.model.Professional
import com.example.hommie.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BookingModal(
    pro: Professional,
    activeLocality: Locality?,
    initialUrgent: Boolean = false,
    onDismiss: () -> Unit,
    onConfirm: (categoryId: String, workerId: String, bookingType: String, scheduledDate: String, scheduledSlot: String, address: String, locality: String, notes: String) -> Unit
) {
    var bookingType by remember { mutableStateOf(if (initialUrgent) "instant" else "instant") }
    var selectedDate by remember { mutableStateOf("Today") }
    var selectedSlot by remember { mutableStateOf("Within 30 mins") }
    var address by remember { mutableStateOf("Flat 402, Royal Palms, 12th Main Rd, ${activeLocality?.name ?: "Gomti Nagar"}, Lucknow") }
    var notes by remember { mutableStateOf("") }

    val basePrice = pro.baseRate
    val platformFee = 15
    val safetyFee = 15
    val totalAmount = basePrice + platformFee + safetyFee

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true),
        containerColor = SurfaceWhite,
        shape = RoundedCornerShape(topStart = 20.dp, topEnd = 20.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .fillMaxHeight(0.92f)
        ) {
            Column(
                modifier = Modifier
                    .weight(1f)
                    .padding(horizontal = 20.dp)
                    .verticalScroll(rememberScrollState())
            ) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    AsyncImage(
                        model = pro.avatarUrl,
                        contentDescription = pro.name,
                        modifier = Modifier
                            .size(48.dp)
                            .clip(CircleShape),
                        contentScale = ContentScale.Crop
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Text(
                            text = "Book Direct with ${pro.name}",
                            fontWeight = FontWeight.Bold,
                            fontSize = 16.sp,
                            color = TextPrimary
                        )
                        Text(
                            text = "${pro.trade} • Lucknow",
                            fontSize = 12.sp,
                            color = BrandAccent
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Mode Selector (Instant vs Scheduled)
                Text(
                    text = "Dispatch Mode",
                    fontWeight = FontWeight.Bold,
                    fontSize = 13.sp,
                    color = TextPrimary
                )
                Spacer(modifier = Modifier.height(8.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Card(
                        modifier = Modifier
                            .weight(1f)
                            .clickable { bookingType = "instant" }
                            .testTag("booking_type_instant"),
                        shape = RoundedCornerShape(10.dp),
                        colors = CardDefaults.cardColors(
                            containerColor = if (bookingType == "instant") AmberLight else CanvasBg
                        ),
                        border = BorderStroke(
                            1.dp,
                            if (bookingType == "instant") BrandAction else CardBorder
                        )
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    imageVector = Icons.Default.Bolt,
                                    contentDescription = null,
                                    tint = BrandAction,
                                    modifier = Modifier.size(16.dp)
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(
                                    text = "⚡ Instant",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 12.sp,
                                    color = BrandAction
                                )
                            }
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = "Arrives in ~${pro.earliestArrivalMins} mins",
                                fontSize = 10.sp,
                                color = TextSecondary
                            )
                        }
                    }

                    Card(
                        modifier = Modifier
                            .weight(1f)
                            .clickable { bookingType = "scheduled" }
                            .testTag("booking_type_scheduled"),
                        shape = RoundedCornerShape(10.dp),
                        colors = CardDefaults.cardColors(
                            containerColor = if (bookingType == "scheduled") SkyLight else CanvasBg
                        ),
                        border = BorderStroke(
                            1.dp,
                            if (bookingType == "scheduled") BrandPrimary else CardBorder
                        )
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    imageVector = Icons.Default.CalendarMonth,
                                    contentDescription = null,
                                    tint = BrandPrimary,
                                    modifier = Modifier.size(16.dp)
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(
                                    text = "📅 Scheduled",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 12.sp,
                                    color = BrandPrimary
                                )
                            }
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = "Pick convenient slot",
                                fontSize = 10.sp,
                                color = TextSecondary
                            )
                        }
                    }
                }

                if (bookingType == "scheduled") {
                    Spacer(modifier = Modifier.height(12.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        listOf("Today", "Tomorrow", "Weekend").forEach { d ->
                            FilterChip(
                                selected = selectedDate == d,
                                onClick = { selectedDate = d },
                                label = { Text(d, fontSize = 11.sp) }
                            )
                        }
                    }
                    Spacer(modifier = Modifier.height(6.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        listOf("Morning (10AM - 1PM)", "Afternoon (2PM - 5PM)", "Evening (5PM - 8PM)").forEach { slot ->
                            FilterChip(
                                selected = selectedSlot == slot,
                                onClick = { selectedSlot = slot },
                                label = { Text(slot, fontSize = 10.sp) }
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Service Address
                Text(
                    text = "Service Address in Lucknow",
                    fontWeight = FontWeight.Bold,
                    fontSize = 13.sp,
                    color = TextPrimary
                )
                Spacer(modifier = Modifier.height(6.dp))
                OutlinedTextField(
                    value = address,
                    onValueChange = { address = it },
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("booking_address_input"),
                    shape = RoundedCornerShape(10.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = BrandPrimary,
                        unfocusedBorderColor = CardBorder
                    ),
                    singleLine = false,
                    maxLines = 2
                )

                Spacer(modifier = Modifier.height(14.dp))

                // Issue Description
                Text(
                    text = "Describe Issue (Optional)",
                    fontWeight = FontWeight.Bold,
                    fontSize = 13.sp,
                    color = TextPrimary
                )
                Spacer(modifier = Modifier.height(6.dp))
                OutlinedTextField(
                    value = notes,
                    onValueChange = { notes = it },
                    placeholder = { Text("e.g. AC cooling low, bathroom water tap dripping, circuit tripping...", fontSize = 11.sp) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("booking_notes_input"),
                    shape = RoundedCornerShape(10.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = BrandPrimary,
                        unfocusedBorderColor = CardBorder
                    ),
                    maxLines = 3
                )

                Spacer(modifier = Modifier.height(16.dp))

                // Transparent Price Itemization
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = CanvasBg),
                    border = BorderStroke(1.dp, CardBorder)
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.ReceiptLong,
                                contentDescription = null,
                                tint = BrandPrimary,
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "Transparent Upfront Pricing Breakdown",
                                fontWeight = FontWeight.Bold,
                                fontSize = 12.sp,
                                color = TextPrimary
                            )
                        }
                        Spacer(modifier = Modifier.height(10.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Service Inspection & Base Rate", fontSize = 11.sp, color = TextSecondary)
                            Text("₹$basePrice", fontWeight = FontWeight.SemiBold, fontSize = 11.sp, color = TextPrimary)
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Fair Platform Connection Fee", fontSize = 11.sp, color = TextSecondary)
                            Text("₹$platformFee", fontWeight = FontWeight.SemiBold, fontSize = 11.sp, color = TextPrimary)
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Safety & Guarantee Protection Fund", fontSize = 11.sp, color = TextSecondary)
                            Text("₹$safetyFee", fontWeight = FontWeight.SemiBold, fontSize = 11.sp, color = TextPrimary)
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        Divider(color = CardBorder, thickness = 0.5.dp)
                        Spacer(modifier = Modifier.height(8.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text("Total Estimated Amount", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = TextPrimary)
                                Text("100% of service fee goes directly to ${pro.name}", fontSize = 9.sp, color = EmeraldSuccess, fontWeight = FontWeight.SemiBold)
                            }
                            Text("₹$totalAmount", fontWeight = FontWeight.ExtraBold, fontSize = 18.sp, color = BrandPrimary)
                        }
                    }
                }
                Spacer(modifier = Modifier.height(20.dp))
            }

            // Bottom CTA
            Surface(
                color = SurfaceWhite,
                shadowElevation = 8.dp,
                modifier = Modifier.fillMaxWidth()
            ) {
                Button(
                    onClick = {
                        onConfirm(
                            pro.categoryIds.firstOrNull() ?: "ac-service",
                            pro.id,
                            bookingType,
                            selectedDate,
                            if (bookingType == "instant") "Arriving in ~${pro.earliestArrivalMins}m" else selectedSlot,
                            address,
                            activeLocality?.name ?: "Gomti Nagar",
                            notes.ifBlank { "${pro.trade} requested at $address" }
                        )
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = BrandPrimary),
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp)
                        .height(48.dp)
                        .testTag("confirm_dispatch_btn")
                ) {
                    Icon(imageVector = Icons.Default.CheckCircle, contentDescription = null)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = if (bookingType == "instant") "Confirm & Dispatch Now (~${pro.earliestArrivalMins}m)" else "Confirm Scheduled Booking",
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp
                    )
                }
            }
        }
    }
}
