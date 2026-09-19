package com.example.hommie.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
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
import com.example.hommie.data.model.Booking
import com.example.hommie.data.model.Locality
import com.example.hommie.ui.theme.*

@Composable
fun LocationSelectorDialog(
    currentLocality: Locality?,
    localities: List<Locality>,
    onSelectLocality: (Locality) -> Unit,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(imageVector = Icons.Default.LocationOn, contentDescription = null, tint = BrandAction)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Select Service Locality in Lucknow", fontSize = 16.sp, fontWeight = FontWeight.Bold)
            }
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("Technicians are dispatched hyperlocally from your selected area for <20 min arrival.", fontSize = 11.sp, color = TextSecondary)
                Spacer(modifier = Modifier.height(6.dp))
                localities.forEach { loc ->
                    val isSelected = loc.id == currentLocality?.id
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { onSelectLocality(loc) }
                            .testTag("locality_option_${loc.id}"),
                        shape = RoundedCornerShape(10.dp),
                        colors = CardDefaults.cardColors(
                            containerColor = if (isSelected) AmberLight else CanvasBg
                        ),
                        border = BorderStroke(1.dp, if (isSelected) BrandAction else CardBorder)
                    ) {
                        Row(
                            modifier = Modifier.padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            RadioButton(selected = isSelected, onClick = { onSelectLocality(loc) })
                            Spacer(modifier = Modifier.width(8.dp))
                            Column {
                                Text(loc.name, fontWeight = FontWeight.Bold, fontSize = 13.sp, color = TextPrimary)
                                Text("Pincode: ${loc.pincode} • Active Pros Ready", fontSize = 10.sp, color = TextSecondary)
                            }
                        }
                    }
                }
            }
        },
        confirmButton = {},
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Close") }
        },
        shape = RoundedCornerShape(16.dp),
        containerColor = SurfaceWhite
    )
}

@Composable
fun PaymentModal(
    booking: Booking,
    onDismiss: () -> Unit,
    onPay: (method: String, upiApp: String?) -> Unit
) {
    var selectedMethod by remember { mutableStateOf("upi") }
    var selectedApp by remember { mutableStateOf("phonepe") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(imageVector = Icons.Default.Payments, contentDescription = null, tint = EmeraldSuccess)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Pay ₹${booking.pricingSummary.finalAmount}", fontSize = 16.sp, fontWeight = FontWeight.Bold)
            }
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text("100% of the service amount transfers directly to ${booking.workerName}.", fontSize = 11.sp, color = TextSecondary)

                // Simulated UPI QR
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                    colors = CardDefaults.cardColors(containerColor = CanvasBg),
                    border = BorderStroke(1.dp, CardBorder)
                ) {
                    Column(modifier = Modifier.padding(12.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(imageVector = Icons.Default.QrCode2, contentDescription = null, modifier = Modifier.size(72.dp), tint = BrandPrimary)
                        Text("Scan UPI QR Code", fontWeight = FontWeight.Bold, fontSize = 11.sp, color = BrandPrimary)
                        Text("UPI ID: hommie.direct@okhdfcbank", fontSize = 9.sp, color = TextSecondary)
                    }
                }

                // Payment Options
                listOf(
                    Triple("upi", "PhonePe UPI Instant", "phonepe"),
                    Triple("upi", "Google Pay UPI", "gpay"),
                    Triple("cash", "Pay Cash to Technician", null)
                ).forEach { (method, label, app) ->
                    val isChosen = selectedMethod == method && selectedApp == app
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable {
                                selectedMethod = method
                                selectedApp = app ?: ""
                            },
                        shape = RoundedCornerShape(8.dp),
                        colors = CardDefaults.cardColors(containerColor = if (isChosen) EmeraldLight else SurfaceWhite),
                        border = BorderStroke(1.dp, if (isChosen) EmeraldSuccess else CardBorder)
                    ) {
                        Row(modifier = Modifier.padding(10.dp), verticalAlignment = Alignment.CenterVertically) {
                            RadioButton(selected = isChosen, onClick = {
                                selectedMethod = method
                                selectedApp = app ?: ""
                            })
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(label, fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = TextPrimary)
                        }
                    }
                }
            }
        },
        confirmButton = {
            Button(
                onClick = { onPay(selectedMethod, selectedApp) },
                colors = ButtonDefaults.buttonColors(containerColor = EmeraldSuccess),
                shape = RoundedCornerShape(8.dp),
                modifier = Modifier.testTag("confirm_payment_btn")
            ) {
                Text("Confirm Payment (₹${booking.pricingSummary.finalAmount})", fontWeight = FontWeight.Bold, fontSize = 11.sp)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Cancel") }
        },
        shape = RoundedCornerShape(16.dp),
        containerColor = SurfaceWhite
    )
}

@Composable
fun RatingModal(
    booking: Booking,
    onDismiss: () -> Unit,
    onSubmit: (rating: Int, comment: String) -> Unit
) {
    var stars by remember { mutableStateOf(5) }
    var reviewText by remember { mutableStateOf("Excellent work, very professional and arrived right on time!") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text("Rate ${booking.workerName}", fontWeight = FontWeight.Bold, fontSize = 16.sp)
        },
        text = {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text("Help fellow Lucknow homeowners discover top verified technicians.", fontSize = 11.sp, color = TextSecondary)
                Spacer(modifier = Modifier.height(12.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    (1..5).forEach { i ->
                        IconButton(onClick = { stars = i }) {
                            Icon(
                                imageVector = if (i <= stars) Icons.Default.Star else Icons.Default.StarBorder,
                                contentDescription = null,
                                tint = BrandAction,
                                modifier = Modifier.size(32.dp)
                            )
                        }
                    }
                }
                Spacer(modifier = Modifier.height(8.dp))
                OutlinedTextField(
                    value = reviewText,
                    onValueChange = { reviewText = it },
                    label = { Text("Your Review & Feedback", fontSize = 11.sp) },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                    maxLines = 3
                )
            }
        },
        confirmButton = {
            Button(
                onClick = { onSubmit(stars, reviewText) },
                colors = ButtonDefaults.buttonColors(containerColor = BrandPrimary),
                shape = RoundedCornerShape(8.dp)
            ) {
                Text("Submit Review", fontWeight = FontWeight.Bold, fontSize = 11.sp)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Skip") }
        },
        shape = RoundedCornerShape(16.dp),
        containerColor = SurfaceWhite
    )
}

@Composable
fun SafetyReportModal(
    booking: Booking?,
    onDismiss: () -> Unit,
    onSubmit: (category: String, description: String) -> Unit
) {
    var category by remember { mutableStateOf("Billing Discrepancy") }
    var desc by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(imageVector = Icons.Default.Shield, contentDescription = null, tint = RoseError)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Safety & Trust Incident Report", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = RoseError)
            }
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("Our Trust & Safety response unit reviews complaints within 15 minutes.", fontSize = 11.sp, color = TextSecondary)
                Spacer(modifier = Modifier.height(4.dp))
                listOf("Billing Discrepancy", "Unprofessional Behavior", "Damage to Property", "Unsafe Workmanship").forEach { opt ->
                    FilterChip(
                        selected = category == opt,
                        onClick = { category = opt },
                        label = { Text(opt, fontSize = 10.sp) }
                    )
                }
                Spacer(modifier = Modifier.height(6.dp))
                OutlinedTextField(
                    value = desc,
                    onValueChange = { desc = it },
                    placeholder = { Text("Describe what happened...", fontSize = 11.sp) },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(8.dp),
                    maxLines = 3
                )
            }
        },
        confirmButton = {
            Button(
                onClick = { onSubmit(category, desc.ifBlank { "Reported $category" }) },
                colors = ButtonDefaults.buttonColors(containerColor = RoseError),
                shape = RoundedCornerShape(8.dp)
            ) {
                Text("Submit Report", fontWeight = FontWeight.Bold, fontSize = 11.sp)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Cancel") }
        },
        shape = RoundedCornerShape(16.dp),
        containerColor = SurfaceWhite
    )
}

@Composable
fun AddAssetModal(
    onDismiss: () -> Unit,
    onAdd: (name: String, category: String, brand: String, room: String, warranty: String) -> Unit
) {
    var name by remember { mutableStateOf("") }
    var category by remember { mutableStateOf("ac-service") }
    var brand by remember { mutableStateOf("") }
    var room by remember { mutableStateOf("Master Bedroom") }
    var warranty by remember { mutableStateOf("Active") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(imageVector = Icons.Default.AddHomeWork, contentDescription = null, tint = BrandPrimary)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Add Home Appliance / Asset", fontSize = 16.sp, fontWeight = FontWeight.Bold)
            }
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Appliance Name (e.g. Split AC 1.5T)", fontSize = 11.sp) },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(8.dp),
                    singleLine = true
                )
                OutlinedTextField(
                    value = brand,
                    onValueChange = { brand = it },
                    label = { Text("Brand & Model (e.g. Daikin, LG, Kent)", fontSize = 11.sp) },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(8.dp),
                    singleLine = true
                )
                OutlinedTextField(
                    value = room,
                    onValueChange = { room = it },
                    label = { Text("Location / Room (e.g. Living Room)", fontSize = 11.sp) },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(8.dp),
                    singleLine = true
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    if (name.isNotBlank()) {
                        onAdd(name, category, brand.ifBlank { "Generic" }, room, warranty)
                    }
                },
                colors = ButtonDefaults.buttonColors(containerColor = BrandPrimary),
                shape = RoundedCornerShape(8.dp)
            ) {
                Text("Add to Passport", fontWeight = FontWeight.Bold, fontSize = 11.sp)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Cancel") }
        },
        shape = RoundedCornerShape(16.dp),
        containerColor = SurfaceWhite
    )
}

@Composable
fun SubmitQuoteModal(
    booking: Booking,
    onDismiss: () -> Unit,
    onSubmit: (parts: Int, labor: Int, description: String) -> Unit
) {
    var partsStr by remember { mutableStateOf("350") }
    var laborStr by remember { mutableStateOf("250") }
    var desc by remember { mutableStateOf("Replaced damaged capacitor and motor coil tuning") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text("Submit On-Site Quote to ${booking.customerName}", fontWeight = FontWeight.Bold, fontSize = 15.sp)
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("The customer will receive an immediate push approval prompt.", fontSize = 11.sp, color = TextSecondary)
                OutlinedTextField(
                    value = desc,
                    onValueChange = { desc = it },
                    label = { Text("Work & Parts Description", fontSize = 11.sp) },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(8.dp)
                )
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = partsStr,
                        onValueChange = { partsStr = it },
                        label = { Text("Parts (₹)", fontSize = 11.sp) },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(8.dp),
                        singleLine = true
                    )
                    OutlinedTextField(
                        value = laborStr,
                        onValueChange = { laborStr = it },
                        label = { Text("Labor (₹)", fontSize = 11.sp) },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(8.dp),
                        singleLine = true
                    )
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    val p = partsStr.toIntOrNull() ?: 0
                    val l = laborStr.toIntOrNull() ?: 0
                    onSubmit(p, l, desc)
                },
                colors = ButtonDefaults.buttonColors(containerColor = BrandAction),
                shape = RoundedCornerShape(8.dp)
            ) {
                Text("Submit to Customer", fontWeight = FontWeight.Bold, fontSize = 11.sp)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Cancel") }
        },
        shape = RoundedCornerShape(16.dp),
        containerColor = SurfaceWhite
    )
}
