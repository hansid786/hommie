package com.example.hommie.ui.screens

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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.hommie.data.model.Category
import com.example.hommie.data.model.Professional
import com.example.hommie.ui.components.StarRatingBadge
import com.example.hommie.ui.components.VerifiedBadge
import com.example.hommie.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DiscoveryScreen(
    professionals: List<Professional>,
    categories: List<Category>,
    selectedCategorySlug: String?,
    searchQuery: String,
    availableNowOnly: Boolean,
    verifiedOnly: Boolean,
    minRating: Double,
    onSearchChange: (String) -> Unit,
    onCategorySelect: (String?) -> Unit,
    onToggleAvailableNow: () -> Unit,
    onToggleVerifiedOnly: () -> Unit,
    onSetMinRating: (Double) -> Unit,
    onProClick: (Professional) -> Unit,
    onBookProClick: (Professional) -> Unit
) {
    // Filtered list
    val filteredPros = professionals.filter { pro ->
        val matchesCategory = selectedCategorySlug == null || pro.categoryIds.contains(selectedCategorySlug)
        val matchesQuery = searchQuery.isBlank() ||
                pro.name.contains(searchQuery, ignoreCase = true) ||
                pro.trade.contains(searchQuery, ignoreCase = true) ||
                pro.about.contains(searchQuery, ignoreCase = true)
        val matchesAvailable = !availableNowOnly || (pro.isAvailable && pro.availableNow)
        val matchesVerified = !verifiedOnly || pro.verifications.hommieVerified
        val matchesRating = pro.ratingAvg >= minRating

        matchesCategory && matchesQuery && matchesAvailable && matchesVerified && matchesRating
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(CanvasBg)
    ) {
        // Search Box
        Surface(
            color = SurfaceWhite,
            shadowElevation = 1.dp
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = onSearchChange,
                    placeholder = { Text("Search by name, trade or skill (e.g. Inverter, AC, Drain)...", fontSize = 12.sp) },
                    leadingIcon = {
                        Icon(imageVector = Icons.Default.Search, contentDescription = null, tint = TextSecondary)
                    },
                    trailingIcon = {
                        if (searchQuery.isNotEmpty()) {
                            IconButton(onClick = { onSearchChange("") }) {
                                Icon(imageVector = Icons.Default.Close, contentDescription = "Clear", tint = TextSecondary)
                            }
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("discovery_search_input"),
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = BrandPrimary,
                        unfocusedBorderColor = CardBorder,
                        focusedContainerColor = CanvasBg,
                        unfocusedContainerColor = CanvasBg
                    ),
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(10.dp))

                // Category Chips
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    item {
                        FilterChip(
                            selected = selectedCategorySlug == null,
                            onClick = { onCategorySelect(null) },
                            label = { Text("All Trades", fontSize = 11.sp, fontWeight = FontWeight.SemiBold) },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = BrandPrimary,
                                selectedLabelColor = Color.White
                            )
                        )
                    }
                    items(categories) { cat ->
                        FilterChip(
                            selected = selectedCategorySlug == cat.slug,
                            onClick = { onCategorySelect(cat.slug) },
                            label = { Text(cat.shortName, fontSize = 11.sp, fontWeight = FontWeight.SemiBold) },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = BrandPrimary,
                                selectedLabelColor = Color.White
                            )
                        )
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                // Toggle Filter Badges
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    FilterChip(
                        selected = availableNowOnly,
                        onClick = onToggleAvailableNow,
                        label = { Text("🟢 Available Now", fontSize = 10.sp) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = EmeraldLight,
                            selectedLabelColor = EmeraldSuccess
                        )
                    )
                    FilterChip(
                        selected = verifiedOnly,
                        onClick = onToggleVerifiedOnly,
                        label = { Text("🛡️ Verified Only", fontSize = 10.sp) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = EmeraldLight,
                            selectedLabelColor = EmeraldSuccess
                        )
                    )
                    FilterChip(
                        selected = minRating >= 4.8,
                        onClick = { onSetMinRating(4.8) },
                        label = { Text("⭐ 4.8+", fontSize = 10.sp) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = AmberLight,
                            selectedLabelColor = BrandAction
                        )
                    )
                }
            }
        }

        // Pro Cards List
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 12.dp, bottom = 96.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "${filteredPros.size} Verified Professionals found",
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp,
                        color = TextSecondary
                    )
                }
            }

            items(filteredPros) { pro ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { onProClick(pro) }
                        .testTag("pro_list_card_${pro.id}"),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = SurfaceWhite),
                    border = BorderStroke(1.dp, CardBorder)
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(verticalAlignment = Alignment.Top) {
                            AsyncImage(
                                model = pro.avatarUrl,
                                contentDescription = pro.name,
                                modifier = Modifier
                                    .size(54.dp)
                                    .clip(CircleShape),
                                contentScale = ContentScale.Crop
                            )
                            Spacer(modifier = Modifier.width(12.dp))
                            Column(modifier = Modifier.weight(1f)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = pro.name,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 15.sp,
                                        color = TextPrimary
                                    )
                                    StarRatingBadge(rating = pro.ratingAvg, reviewCount = pro.ratingCount)
                                }
                                Text(
                                    text = pro.trade,
                                    fontWeight = FontWeight.Medium,
                                    fontSize = 12.sp,
                                    color = BrandAccent
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Row(
                                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    VerifiedBadge()
                                    Text(
                                        text = "• ${pro.experienceYears} yrs exp",
                                        fontSize = 10.sp,
                                        color = TextSecondary
                                    )
                                    Text(
                                        text = "• ${pro.jobsCompleted} jobs",
                                        fontSize = 10.sp,
                                        color = TextSecondary
                                    )
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        Text(
                            text = pro.headline,
                            fontSize = 11.sp,
                            color = TextSecondary,
                            lineHeight = 15.sp
                        )

                        Spacer(modifier = Modifier.height(8.dp))

                        // Localities Served
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.LocationOn,
                                contentDescription = null,
                                tint = TextMuted,
                                modifier = Modifier.size(13.dp)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "Serves: " + pro.serviceLocalities.joinToString(", "),
                                fontSize = 10.sp,
                                color = TextSecondary,
                                maxLines = 1
                            )
                        }

                        Spacer(modifier = Modifier.height(12.dp))
                        Divider(color = CardBorder, thickness = 0.5.dp)
                        Spacer(modifier = Modifier.height(10.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Row(verticalAlignment = Alignment.Bottom) {
                                    Text(
                                        text = "₹${pro.baseRate}",
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 16.sp,
                                        color = BrandPrimary
                                    )
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text(
                                        text = "base rate",
                                        fontSize = 10.sp,
                                        color = TextSecondary
                                    )
                                }
                                Text(
                                    text = "Inspection: ₹${pro.inspectionFee}",
                                    fontSize = 9.sp,
                                    color = TextSecondary
                                )
                            }

                            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                OutlinedButton(
                                    onClick = { onProClick(pro) },
                                    shape = RoundedCornerShape(8.dp),
                                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                                ) {
                                    Text("Profile", fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
                                }
                                Button(
                                    onClick = { onBookProClick(pro) },
                                    shape = RoundedCornerShape(8.dp),
                                    colors = ButtonDefaults.buttonColors(containerColor = BrandPrimary),
                                    contentPadding = PaddingValues(horizontal = 14.dp, vertical = 6.dp)
                                ) {
                                    Text("Book Direct", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
