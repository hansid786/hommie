package com.example.hommie.ui.screens

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
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
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.hommie.R
import com.example.hommie.data.model.Booking
import com.example.hommie.data.model.Category
import com.example.hommie.data.model.Locality
import com.example.hommie.data.model.Professional
import com.example.hommie.ui.components.FairShareGuaranteeCard
import com.example.hommie.ui.components.StarRatingBadge
import com.example.hommie.ui.components.VerifiedBadge
import com.example.hommie.ui.theme.*

@Composable
fun HomeScreen(
    activeLocality: Locality?,
    categories: List<Category>,
    professionals: List<Professional>,
    activeBookings: List<Booking>,
    onCategoryClick: (Category) -> Unit,
    onProClick: (Professional) -> Unit,
    onBookProClick: (Professional) -> Unit,
    onUrgentDispatchClick: () -> Unit,
    onActiveBookingClick: (Booking) -> Unit,
    onViewAllProsClick: () -> Unit
) {
    val activeBooking = activeBookings.find { it.status != "completed" && it.status != "cancelled_by_customer" }
    val availablePros = professionals.filter { it.isAvailable && it.availableNow }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(CanvasBg),
        contentPadding = PaddingValues(bottom = 96.dp)
    ) {
        // 1. Hero Banner Image
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                shape = RoundedCornerShape(18.dp),
                colors = CardDefaults.cardColors(containerColor = BrandPrimary)
            ) {
                Column {
                    Image(
                        painter = painterResource(id = R.drawable.hommie_hero_banner),
                        contentDescription = "HOMMIE Skilled Services",
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(140.dp)
                            .clip(RoundedCornerShape(topStart = 18.dp, topEnd = 18.dp)),
                        contentScale = ContentScale.Crop
                    )
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.Shield,
                                contentDescription = null,
                                tint = BrandAccent,
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "LUCKNOW'S HYPERLOCAL NETWORK",
                                color = BrandAction,
                                fontWeight = FontWeight.ExtraBold,
                                fontSize = 11.sp,
                                letterSpacing = 0.5.sp
                            )
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "Trusted Local Experts at Zero Middleman Markup",
                            color = Color.White,
                            fontWeight = FontWeight.Bold,
                            fontSize = 18.sp,
                            lineHeight = 24.sp
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = "Direct booking with independent ITI certified technicians across ${activeLocality?.name ?: "Gomti Nagar"}.",
                            color = Color(0xFF94A3B8),
                            fontSize = 12.sp
                        )
                    }
                }
            }
        }

        // 2. Active Booking Tracker Capsule (if active)
        if (activeBooking != null) {
            item {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 6.dp)
                        .clickable { onActiveBookingClick(activeBooking) }
                        .testTag("active_booking_capsule"),
                    colors = CardDefaults.cardColors(containerColor = EmeraldLight),
                    border = BorderStroke(1.dp, Color(0xFFA7F3D0)),
                    shape = RoundedCornerShape(14.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(42.dp)
                                .clip(CircleShape)
                                .background(EmeraldSuccess),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.DirectionsRun,
                                contentDescription = null,
                                tint = Color.White,
                                modifier = Modifier.size(24.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    text = "ACTIVE DISPATCH",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 10.sp,
                                    color = EmeraldSuccess
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = "• Ref: ${activeBooking.bookingRef}",
                                    fontSize = 10.sp,
                                    color = TextSecondary
                                )
                            }
                            Text(
                                text = "${activeBooking.workerName} (${activeBooking.serviceTitle})",
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp,
                                color = TextPrimary
                            )
                            Text(
                                text = "Status: ${activeBooking.status.replace("_", " ").uppercase()} • ETA ~${activeBooking.etaMinutes}m",
                                fontSize = 11.sp,
                                color = TextSecondary
                            )
                        }
                        Button(
                            onClick = { onActiveBookingClick(activeBooking) },
                            colors = ButtonDefaults.buttonColors(containerColor = EmeraldSuccess),
                            contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Text("Track", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }

        // 3. Urgent 15-Min Dispatch Card
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp)
                    .clickable(onClick = onUrgentDispatchClick)
                    .testTag("urgent_dispatch_banner"),
                colors = CardDefaults.cardColors(containerColor = Color(0xFFFEF3C7)),
                border = BorderStroke(1.dp, Color(0xFFFDE68A)),
                shape = RoundedCornerShape(14.dp)
            ) {
                Row(
                    modifier = Modifier.padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(40.dp)
                            .clip(CircleShape)
                            .background(BrandAction),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Bolt,
                            contentDescription = null,
                            tint = Color.White,
                            modifier = Modifier.size(24.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = "15-Min Urgent Dispatch",
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp,
                                color = Color(0xFF92400E)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "⚡ ACTIVE",
                                fontWeight = FontWeight.ExtraBold,
                                fontSize = 9.sp,
                                color = BrandAction
                            )
                        }
                        Text(
                            text = "Electric tripping, pipe burst or AC breakdown in ${activeLocality?.name ?: "Lucknow"}",
                            fontSize = 11.sp,
                            color = Color(0xFFB45309)
                        )
                    }
                    Icon(
                        imageVector = Icons.Default.ChevronRight,
                        contentDescription = "Go",
                        tint = BrandAction
                    )
                }
            }
        }

        // 4. Categories Section
        item {
            Column(modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Essential Home Services",
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp,
                        color = TextPrimary
                    )
                    Text(
                        text = "View All",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = BrandAccent,
                        modifier = Modifier.clickable(onClick = onViewAllProsClick)
                    )
                }
                Spacer(modifier = Modifier.height(10.dp))
            }
        }

        // 2x3 Grid of Categories
        items(categories.chunked(2)) { pair ->
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 4.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                pair.forEach { category ->
                    Card(
                        modifier = Modifier
                            .weight(1f)
                            .clickable { onCategoryClick(category) }
                            .testTag("category_card_${category.slug}"),
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = SurfaceWhite),
                        border = BorderStroke(1.dp, CardBorder)
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.Top
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(36.dp)
                                        .clip(RoundedCornerShape(8.dp))
                                        .background(Color(android.graphics.Color.parseColor(category.colorHex)).copy(alpha = 0.12f)),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(
                                        imageVector = when (category.slug) {
                                            "ac-service" -> Icons.Default.AcUnit
                                            "electrician" -> Icons.Default.Bolt
                                            "plumber" -> Icons.Default.WaterDrop
                                            "appliance" -> Icons.Default.Memory
                                            "carpenter" -> Icons.Default.Handyman
                                            else -> Icons.Default.CleaningServices
                                        },
                                        contentDescription = category.name,
                                        tint = Color(android.graphics.Color.parseColor(category.colorHex)),
                                        modifier = Modifier.size(20.dp)
                                    )
                                }
                                Text(
                                    text = category.badge,
                                    fontSize = 8.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = BrandAction,
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(4.dp))
                                        .background(AmberLight)
                                        .padding(horizontal = 4.dp, vertical = 2.dp)
                                )
                            }
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = category.shortName,
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp,
                                color = TextPrimary
                            )
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = "Starts at ₹${category.startingPrice}",
                                fontSize = 11.sp,
                                color = BrandAccent,
                                fontWeight = FontWeight.SemiBold
                            )
                            Text(
                                text = "Inspection ₹${category.inspectionFee}",
                                fontSize = 9.sp,
                                color = TextSecondary
                            )
                        }
                    }
                }
                if (pair.size == 1) {
                    Spacer(modifier = Modifier.weight(1f))
                }
            }
        }

        // 5. Available Now Section (Horizontal Carousel)
        item {
            Column(modifier = Modifier.padding(top = 16.dp)) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(8.dp)
                                .clip(CircleShape)
                                .background(EmeraldSuccess)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "Available Now Nearby",
                            fontWeight = FontWeight.Bold,
                            fontSize = 16.sp,
                            color = TextPrimary
                        )
                    }
                    Text(
                        text = "${availablePros.size} online",
                        fontSize = 12.sp,
                        color = EmeraldSuccess,
                        fontWeight = FontWeight.Bold
                    )
                }
                Spacer(modifier = Modifier.height(10.dp))

                LazyRow(
                    contentPadding = PaddingValues(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(availablePros) { pro ->
                        Card(
                            modifier = Modifier
                                .width(240.dp)
                                .clickable { onProClick(pro) }
                                .testTag("pro_preview_card_${pro.id}"),
                            shape = RoundedCornerShape(14.dp),
                            colors = CardDefaults.cardColors(containerColor = SurfaceWhite),
                            border = BorderStroke(1.dp, CardBorder)
                        ) {
                            Column(modifier = Modifier.padding(14.dp)) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    AsyncImage(
                                        model = pro.avatarUrl,
                                        contentDescription = pro.name,
                                        modifier = Modifier
                                            .size(46.dp)
                                            .clip(CircleShape),
                                        contentScale = ContentScale.Crop
                                    )
                                    Spacer(modifier = Modifier.width(10.dp))
                                    Column {
                                        Text(
                                            text = pro.name,
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 13.sp,
                                            color = TextPrimary
                                        )
                                        Text(
                                            text = pro.trade,
                                            fontSize = 10.sp,
                                            color = TextSecondary,
                                            maxLines = 1
                                        )
                                        Spacer(modifier = Modifier.height(2.dp))
                                        VerifiedBadge()
                                    }
                                }
                                Spacer(modifier = Modifier.height(10.dp))
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    StarRatingBadge(rating = pro.ratingAvg, reviewCount = pro.ratingCount)
                                    Text(
                                        text = "⚡ ~${pro.earliestArrivalMins}m arrival",
                                        fontSize = 10.sp,
                                        color = EmeraldSuccess,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                                Spacer(modifier = Modifier.height(10.dp))
                                Divider(color = CardBorder, thickness = 0.5.dp)
                                Spacer(modifier = Modifier.height(8.dp))
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column {
                                        Text(text = "From", fontSize = 9.sp, color = TextSecondary)
                                        Text(
                                            text = "₹${pro.baseRate}",
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 14.sp,
                                            color = BrandPrimary
                                        )
                                    }
                                    Button(
                                        onClick = { onBookProClick(pro) },
                                        shape = RoundedCornerShape(8.dp),
                                        colors = ButtonDefaults.buttonColors(containerColor = BrandPrimary),
                                        contentPadding = PaddingValues(horizontal = 14.dp, vertical = 6.dp)
                                    ) {
                                        Text("Book", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // 6. Fair Share Guarantee Section
        item {
            Spacer(modifier = Modifier.height(20.dp))
            FairShareGuaranteeCard()
        }
    }
}
