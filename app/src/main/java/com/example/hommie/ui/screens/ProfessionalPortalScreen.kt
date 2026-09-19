package com.example.hommie.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.hommie.data.model.Booking
import com.example.hommie.data.model.Professional
import com.example.hommie.ui.theme.*

@Composable
fun ProfessionalPortalScreen(
    pro: Professional,
    bookings: List<Booking>,
    onToggleOnline: (Boolean) -> Unit,
    onAdvanceStatus: (bookingId: String, nextStatus: String, note: String?) -> Unit,
    onSubmitQuoteClick: (booking: Booking) -> Unit,
    onOpenChat: (booking: Booking) -> Unit
) {
    val myBookings = bookings.filter { it.workerId == pro.id }
    val activeJobs = myBookings.filter { it.status != "completed" && it.status != "cancelled_by_customer" }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(CanvasBg),
        contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 16.dp, bottom = 96.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        // 1. Worker Header & Availability Toggle
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = BrandPrimary)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            AsyncImage(
                                model = pro.avatarUrl,
                                contentDescription = pro.name,
                                modifier = Modifier
                                    .size(48.dp)
                                    .clip(CircleShape)
                            )
                            Spacer(modifier = Modifier.width(12.dp))
                            Column {
                                Text(
                                    text = "${pro.name} (Pro Hub)",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 16.sp,
                                    color = Color.White
                                )
                                Text(
                                    text = pro.trade,
                                    fontSize = 11.sp,
                                    color = Color(0xFF94A3B8)
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))
                    Divider(color = Color(0xFF334155), thickness = 0.5.dp)
                    Spacer(modifier = Modifier.height(12.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = if (pro.isAvailable) "YOU ARE ONLINE" else "YOU ARE OFFLINE",
                                fontWeight = FontWeight.Bold,
                                fontSize = 12.sp,
                                color = if (pro.isAvailable) EmeraldSuccess else RoseError
                            )
                            Text(
                                text = if (pro.isAvailable) "Receiving direct customer dispatches" else "Not visible in search results",
                                fontSize = 10.sp,
                                color = Color(0xFF94A3B8)
                            )
                        }
                        Switch(
                            checked = pro.isAvailable,
                            onCheckedChange = onToggleOnline,
                            modifier = Modifier.testTag("worker_online_toggle")
                        )
                    }
                }
            }
        }

        // 2. Performance Summary
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Card(
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(10.dp),
                    colors = CardDefaults.cardColors(containerColor = SurfaceWhite),
                    border = BorderStroke(1.dp, CardBorder)
                ) {
                    Column(modifier = Modifier.padding(10.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("₹3,450", fontWeight = FontWeight.ExtraBold, fontSize = 15.sp, color = BrandPrimary)
                        Text("Today's Net", fontSize = 10.sp, color = TextSecondary)
                    }
                }
                Card(
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(10.dp),
                    colors = CardDefaults.cardColors(containerColor = SurfaceWhite),
                    border = BorderStroke(1.dp, CardBorder)
                ) {
                    Column(modifier = Modifier.padding(10.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("${pro.jobsCompleted}", fontWeight = FontWeight.ExtraBold, fontSize = 15.sp, color = BrandPrimary)
                        Text("Completed", fontSize = 10.sp, color = TextSecondary)
                    }
                }
                Card(
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(10.dp),
                    colors = CardDefaults.cardColors(containerColor = SurfaceWhite),
                    border = BorderStroke(1.dp, CardBorder)
                ) {
                    Column(modifier = Modifier.padding(10.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("${pro.ratingAvg}★", fontWeight = FontWeight.ExtraBold, fontSize = 15.sp, color = BrandAction)
                        Text("Rating", fontSize = 10.sp, color = TextSecondary)
                    }
                }
            }
        }

        // 3. Active Dispatches Section
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Active Job Dispatches (${activeJobs.size})",
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp,
                    color = TextPrimary
                )
            }
        }

        if (activeJobs.isEmpty()) {
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = SurfaceWhite),
                    border = BorderStroke(1.dp, CardBorder)
                ) {
                    Box(modifier = Modifier.padding(24.dp).fillMaxWidth(), contentAlignment = Alignment.Center) {
                        Text("No active jobs pending right now.", fontSize = 12.sp, color = TextSecondary)
                    }
                }
            }
        } else {
            items(activeJobs) { job ->
                Card(
                    modifier = Modifier.fillMaxWidth().testTag("worker_job_card_${job.id}"),
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
                            Text(text = "REF: ${job.bookingRef}", fontWeight = FontWeight.Bold, fontSize = 11.sp, color = TextSecondary)
                            Text(
                                text = job.status.replace("_", " ").uppercase(),
                                fontWeight = FontWeight.Bold,
                                fontSize = 9.sp,
                                color = BrandAction,
                                modifier = Modifier
                                    .clip(RoundedCornerShape(4.dp))
                                    .background(AmberLight)
                                    .padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }

                        Spacer(modifier = Modifier.height(6.dp))
                        Text(text = job.serviceTitle, fontWeight = FontWeight.Bold, fontSize = 14.sp, color = TextPrimary)
                        Text(text = "Customer: ${job.customerName} (${job.customerPhone})", fontSize = 11.sp, color = BrandAccent)
                        Text(text = "Address: ${job.addressFormatted}", fontSize = 11.sp, color = TextSecondary)
                        Text(text = "Issue: ${job.problemDescription}", fontSize = 10.sp, color = TextMuted)

                        Spacer(modifier = Modifier.height(10.dp))
                        Divider(color = CardBorder, thickness = 0.5.dp)
                        Spacer(modifier = Modifier.height(8.dp))

                        // Worker action buttons depending on status
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            OutlinedButton(
                                onClick = { onOpenChat(job) },
                                modifier = Modifier.weight(1f),
                                shape = RoundedCornerShape(8.dp),
                                contentPadding = PaddingValues(vertical = 6.dp)
                            ) {
                                Icon(imageVector = Icons.Default.Chat, contentDescription = null, modifier = Modifier.size(14.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("Chat", fontSize = 11.sp)
                            }

                            when (job.status) {
                                "pro_assigned" -> {
                                    Button(
                                        onClick = { onAdvanceStatus(job.id, "en_route", "Technician started trip") },
                                        modifier = Modifier.weight(1.5f),
                                        colors = ButtonDefaults.buttonColors(containerColor = BrandAction),
                                        shape = RoundedCornerShape(8.dp)
                                    ) {
                                        Text("Start Trip (En Route)", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                    }
                                }
                                "en_route" -> {
                                    Button(
                                        onClick = { onAdvanceStatus(job.id, "on_site", "Technician reached location") },
                                        modifier = Modifier.weight(1.5f),
                                        colors = ButtonDefaults.buttonColors(containerColor = BrandPrimary),
                                        shape = RoundedCornerShape(8.dp)
                                    ) {
                                        Text("Mark Arrived (On Site)", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                    }
                                }
                                "on_site" -> {
                                    Button(
                                        onClick = { onSubmitQuoteClick(job) },
                                        modifier = Modifier.weight(1.5f),
                                        colors = ButtonDefaults.buttonColors(containerColor = BrandAction),
                                        shape = RoundedCornerShape(8.dp)
                                    ) {
                                        Text("Submit Estimate", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                    }
                                }
                                "quote_submitted" -> {
                                    Text(
                                        text = "Awaiting customer approval...",
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        color = BrandAction,
                                        modifier = Modifier.align(Alignment.CenterVertically)
                                    )
                                }
                                "quote_approved", "in_progress" -> {
                                    Button(
                                        onClick = { onAdvanceStatus(job.id, "completed", "Work completed, payment pending") },
                                        modifier = Modifier.weight(1.5f),
                                        colors = ButtonDefaults.buttonColors(containerColor = EmeraldSuccess),
                                        shape = RoundedCornerShape(8.dp)
                                    ) {
                                        Text("Finish & Request Pay", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // 4. Payout Info Card
        if (pro.payoutBank != null) {
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = CanvasBg),
                    border = BorderStroke(1.dp, CardBorder)
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(imageVector = Icons.Default.AccountBalance, contentDescription = null, tint = BrandPrimary, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Direct Payout Account (Zero Deductions)", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = TextPrimary)
                        }
                        Spacer(modifier = Modifier.height(6.dp))
                        Text("Account: ${pro.payoutBank.accountHolder} (${pro.payoutBank.accountMasked})", fontSize = 11.sp, color = TextSecondary)
                        Text("UPI ID: ${pro.payoutBank.upiId}", fontSize = 11.sp, color = TextSecondary)
                    }
                }
            }
        }
    }
}
