package com.example.hommie.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.hommie.data.model.Professional
import com.example.hommie.ui.components.StarRatingBadge
import com.example.hommie.ui.components.VerifiedBadge
import com.example.hommie.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProProfileSheet(
    pro: Professional,
    onDismiss: () -> Unit,
    onBookClick: (Professional) -> Unit
) {
    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true),
        containerColor = SurfaceWhite,
        shape = RoundedCornerShape(topStart = 20.dp, topEnd = 20.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .fillMaxHeight(0.9f)
        ) {
            LazyColumn(
                modifier = Modifier
                    .weight(1f)
                    .padding(horizontal = 20.dp),
                contentPadding = PaddingValues(bottom = 20.dp)
            ) {
                // 1. Header Profile
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        AsyncImage(
                            model = pro.avatarUrl,
                            contentDescription = pro.name,
                            modifier = Modifier
                                .size(64.dp)
                                .clip(CircleShape),
                            contentScale = ContentScale.Crop
                        )
                        Spacer(modifier = Modifier.width(16.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = pro.name,
                                fontWeight = FontWeight.Bold,
                                fontSize = 18.sp,
                                color = TextPrimary
                            )
                            Text(
                                text = pro.trade,
                                fontWeight = FontWeight.Medium,
                                fontSize = 13.sp,
                                color = BrandAccent
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                StarRatingBadge(rating = pro.ratingAvg, reviewCount = pro.ratingCount)
                                Spacer(modifier = Modifier.width(8.dp))
                                VerifiedBadge()
                            }
                        }
                    }
                    Spacer(modifier = Modifier.height(16.dp))
                }

                // 2. Verification Checklist Card
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = EmeraldLight),
                        border = BorderStroke(1.dp, Color(0xFFA7F3D0))
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    imageVector = Icons.Default.Shield,
                                    contentDescription = null,
                                    tint = EmeraldSuccess,
                                    modifier = Modifier.size(18.dp)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = "HOMMIE 4-Tier Verification Guarantee",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 12.sp,
                                    color = EmeraldSuccess
                                )
                            }
                            Spacer(modifier = Modifier.height(8.dp))
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Column {
                                    Text("✓ Aadhaar / Govt ID Verified", fontSize = 11.sp, color = TextPrimary)
                                    Text("✓ Police Background Check", fontSize = 11.sp, color = TextPrimary)
                                }
                                Column {
                                    Text("✓ ITI / Trade Certified", fontSize = 11.sp, color = TextPrimary)
                                    Text("✓ Address Physical Audit", fontSize = 11.sp, color = TextPrimary)
                                }
                            }
                        }
                    }
                    Spacer(modifier = Modifier.height(16.dp))
                }

                // 3. Stats Row
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Card(
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(10.dp),
                            colors = CardDefaults.cardColors(containerColor = CanvasBg),
                            border = BorderStroke(1.dp, CardBorder)
                        ) {
                            Column(modifier = Modifier.padding(10.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                                Text(text = "${pro.jobsCompleted}+", fontWeight = FontWeight.Bold, fontSize = 15.sp, color = BrandPrimary)
                                Text(text = "Jobs Done", fontSize = 10.sp, color = TextSecondary)
                            }
                        }
                        Card(
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(10.dp),
                            colors = CardDefaults.cardColors(containerColor = CanvasBg),
                            border = BorderStroke(1.dp, CardBorder)
                        ) {
                            Column(modifier = Modifier.padding(10.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                                Text(text = "${pro.experienceYears} Yrs", fontWeight = FontWeight.Bold, fontSize = 15.sp, color = BrandPrimary)
                                Text(text = "Experience", fontSize = 10.sp, color = TextSecondary)
                            }
                        }
                        Card(
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(10.dp),
                            colors = CardDefaults.cardColors(containerColor = CanvasBg),
                            border = BorderStroke(1.dp, CardBorder)
                        ) {
                            Column(modifier = Modifier.padding(10.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                                Text(text = "${pro.responseRatePercent}%", fontWeight = FontWeight.Bold, fontSize = 15.sp, color = BrandPrimary)
                                Text(text = "Response Rate", fontSize = 10.sp, color = TextSecondary)
                            }
                        }
                    }
                    Spacer(modifier = Modifier.height(16.dp))
                }

                // 4. About & Experience
                item {
                    Text(
                        text = "About ${pro.name}",
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp,
                        color = TextPrimary
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = pro.about,
                        fontSize = 12.sp,
                        color = TextSecondary,
                        lineHeight = 18.sp
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                }

                // 5. Portfolio Work Showcase (if present)
                if (pro.portfolio.isNotEmpty()) {
                    item {
                        Text(
                            text = "Recent Job Showcase",
                            fontWeight = FontWeight.Bold,
                            fontSize = 15.sp,
                            color = TextPrimary
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        LazyRow(
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            items(pro.portfolio) { item ->
                                Card(
                                    modifier = Modifier.width(180.dp),
                                    shape = RoundedCornerShape(10.dp),
                                    border = BorderStroke(1.dp, CardBorder)
                                ) {
                                    Column {
                                        AsyncImage(
                                            model = item.imageUrl,
                                            contentDescription = item.title,
                                            modifier = Modifier
                                                .fillMaxWidth()
                                                .height(100.dp),
                                            contentScale = ContentScale.Crop
                                        )
                                        Text(
                                            text = item.title,
                                            fontSize = 10.sp,
                                            fontWeight = FontWeight.SemiBold,
                                            color = TextPrimary,
                                            modifier = Modifier.padding(8.dp),
                                            maxLines = 1
                                        )
                                    }
                                }
                            }
                        }
                        Spacer(modifier = Modifier.height(16.dp))
                    }
                }

                // 6. Verified Customer Reviews
                if (pro.reviews.isNotEmpty()) {
                    item {
                        Text(
                            text = "Customer Reviews (${pro.reviews.size})",
                            fontWeight = FontWeight.Bold,
                            fontSize = 15.sp,
                            color = TextPrimary
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                    }
                    items(pro.reviews) { rev ->
                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 4.dp),
                            shape = RoundedCornerShape(10.dp),
                            colors = CardDefaults.cardColors(containerColor = CanvasBg),
                            border = BorderStroke(1.dp, CardBorder)
                        ) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = rev.customerName,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 12.sp,
                                        color = TextPrimary
                                    )
                                    Text(
                                        text = rev.date,
                                        fontSize = 10.sp,
                                        color = TextMuted
                                    )
                                }
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    repeat(rev.rating) {
                                        Icon(
                                            imageVector = Icons.Default.Star,
                                            contentDescription = null,
                                            tint = BrandAction,
                                            modifier = Modifier.size(12.dp)
                                        )
                                    }
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text(
                                        text = "• ${rev.service}",
                                        fontSize = 10.sp,
                                        color = TextSecondary
                                    )
                                }
                                Spacer(modifier = Modifier.height(6.dp))
                                Text(
                                    text = "\"${rev.comment}\"",
                                    fontSize = 11.sp,
                                    color = TextSecondary,
                                    fontStyle = androidx.compose.ui.text.font.FontStyle.Italic
                                )
                            }
                        }
                    }
                }
            }

            // Bottom Sticky Action Bar
            Surface(
                color = SurfaceWhite,
                shadowElevation = 8.dp,
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(text = "Starting From", fontSize = 10.sp, color = TextSecondary)
                        Row(verticalAlignment = Alignment.Bottom) {
                            Text(
                                text = "₹${pro.baseRate}",
                                fontWeight = FontWeight.Bold,
                                fontSize = 20.sp,
                                color = BrandPrimary
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "+ ₹${pro.inspectionFee} insp.",
                                fontSize = 10.sp,
                                color = TextSecondary
                            )
                        }
                    }

                    Button(
                        onClick = { onBookClick(pro) },
                        colors = ButtonDefaults.buttonColors(containerColor = BrandPrimary),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier
                            .height(48.dp)
                            .testTag("book_pro_sheet_btn")
                    ) {
                        Icon(imageVector = Icons.Default.CalendarMonth, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(text = "Book Direct", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    }
                }
            }
        }
    }
}
