package com.example.hommie.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.hommie.data.model.AuditLog
import com.example.hommie.data.model.Booking
import com.example.hommie.data.model.Professional
import com.example.hommie.data.model.SafetyReport
import com.example.hommie.ui.theme.*

@Composable
fun AdminPortalScreen(
    bookings: List<Booking>,
    professionals: List<Professional>,
    auditLogs: List<AuditLog>,
    safetyReports: List<SafetyReport>
) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(CanvasBg),
        contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 16.dp, bottom = 96.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        // 1. Admin Header
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF1E1B4B)) // Deep Indigo
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(imageVector = Icons.Default.AdminPanelSettings, contentDescription = null, tint = Color(0xFFA855F7), modifier = Modifier.size(22.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("HOMMIE PLATFORM CONTROL", color = Color(0xFFA855F7), fontWeight = FontWeight.Bold, fontSize = 11.sp)
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Marketplace Health & Audit Operations",
                        color = Color.White,
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp
                    )
                    Text(
                        text = "Lucknow Region • Gomti Nagar, Hazratganj, Aliganj & Indira Nagar",
                        color = Color(0xFFCBD5E1),
                        fontSize = 11.sp
                    )
                }
            }
        }

        // 2. Metrics Grid
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
                    Column(modifier = Modifier.padding(10.dp)) {
                        Text("Active Pros", fontSize = 10.sp, color = TextSecondary)
                        Text("${professionals.size}", fontWeight = FontWeight.ExtraBold, fontSize = 16.sp, color = BrandPrimary)
                        Text("100% Vetted", fontSize = 9.sp, color = EmeraldSuccess, fontWeight = FontWeight.Bold)
                    }
                }
                Card(
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(10.dp),
                    colors = CardDefaults.cardColors(containerColor = SurfaceWhite),
                    border = BorderStroke(1.dp, CardBorder)
                ) {
                    Column(modifier = Modifier.padding(10.dp)) {
                        Text("Bookings", fontSize = 10.sp, color = TextSecondary)
                        Text("${bookings.size}", fontWeight = FontWeight.ExtraBold, fontSize = 16.sp, color = BrandPrimary)
                        Text("₹${bookings.sumOf { it.pricingSummary.finalAmount }} Gross", fontSize = 9.sp, color = BrandAccent)
                    }
                }
                Card(
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(10.dp),
                    colors = CardDefaults.cardColors(containerColor = SurfaceWhite),
                    border = BorderStroke(1.dp, CardBorder)
                ) {
                    Column(modifier = Modifier.padding(10.dp)) {
                        Text("Safety Index", fontSize = 10.sp, color = TextSecondary)
                        Text("99.8%", fontWeight = FontWeight.ExtraBold, fontSize = 16.sp, color = EmeraldSuccess)
                        Text("Zero Incidents", fontSize = 9.sp, color = EmeraldSuccess)
                    }
                }
            }
        }

        // 3. Safety Reports Queue (if any)
        if (safetyReports.isNotEmpty()) {
            item {
                Text(
                    text = "Safety Incidents Queue (${safetyReports.size})",
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp,
                    color = RoseError
                )
            }
            items(safetyReports) { report ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                    colors = CardDefaults.cardColors(containerColor = RoseLight),
                    border = BorderStroke(1.dp, Color(0xFFFECDD3))
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text(text = "Category: ${report.category}", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = RoseError)
                        Text(text = report.description, fontSize = 11.sp, color = TextPrimary)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(text = "Reported by: ${report.reporterName} • ${report.timestamp}", fontSize = 9.sp, color = TextSecondary)
                    }
                }
            }
        }

        // 4. Real-time Audit Trail
        item {
            Text(
                text = "System Audit Trail & State Logs",
                fontWeight = FontWeight.Bold,
                fontSize = 14.sp,
                color = TextPrimary
            )
        }

        items(auditLogs) { log ->
            Card(
                modifier = Modifier.fillMaxWidth().testTag("audit_log_${log.id}"),
                shape = RoundedCornerShape(10.dp),
                colors = CardDefaults.cardColors(containerColor = SurfaceWhite),
                border = BorderStroke(1.dp, CardBorder)
            ) {
                Row(
                    modifier = Modifier.padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(32.dp)
                            .clip(RoundedCornerShape(6.dp))
                            .background(
                                when (log.actor) {
                                    "Customer" -> SkyLight
                                    "Worker" -> AmberLight
                                    else -> EmeraldLight
                                }
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = log.actor.take(1),
                            fontWeight = FontWeight.Bold,
                            fontSize = 12.sp,
                            color = BrandPrimary
                        )
                    }
                    Spacer(modifier = Modifier.width(10.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(text = log.action, fontWeight = FontWeight.Bold, fontSize = 11.sp, color = BrandPrimary)
                            Text(text = log.timestamp, fontSize = 9.sp, color = TextMuted)
                        }
                        Text(text = log.details, fontSize = 11.sp, color = TextSecondary)
                    }
                }
            }
        }
    }
}
