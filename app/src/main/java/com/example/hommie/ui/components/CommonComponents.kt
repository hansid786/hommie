package com.example.hommie.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
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
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.hommie.data.model.Locality
import com.example.hommie.data.model.UserRole
import com.example.hommie.ui.theme.*

@Composable
fun LocalityTopBar(
    activeLocality: Locality?,
    currentRole: UserRole,
    onLocationClick: () -> Unit,
    onRoleClick: () -> Unit,
    onSafetyClick: () -> Unit
) {
    Surface(
        color = BrandPrimary,
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .statusBarsPadding()
                .padding(horizontal = 16.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            // Location Selector Pill
            Row(
                modifier = Modifier
                    .clip(RoundedCornerShape(20.dp))
                    .background(Color(0xFF1E293B))
                    .clickable(onClick = onLocationClick)
                    .padding(horizontal = 12.dp, vertical = 6.dp)
                    .testTag("location_selector_btn"),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Default.LocationOn,
                    contentDescription = "Location",
                    tint = BrandAction,
                    modifier = Modifier.size(16.dp)
                )
                Spacer(modifier = Modifier.width(6.dp))
                Column {
                    Text(
                        text = activeLocality?.name ?: "Gomti Nagar",
                        color = Color.White,
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp
                    )
                    Text(
                        text = "Lucknow • ${activeLocality?.pincode ?: "226010"}",
                        color = Color(0xFF94A3B8),
                        fontSize = 10.sp
                    )
                }
                Spacer(modifier = Modifier.width(4.dp))
                Icon(
                    imageVector = Icons.Default.KeyboardArrowDown,
                    contentDescription = "Change",
                    tint = Color.White,
                    modifier = Modifier.size(16.dp)
                )
            }

            // Right Actions: Role Switcher & Safety Shield
            Row(verticalAlignment = Alignment.CenterVertically) {
                // Safety Shield Icon
                IconButton(
                    onClick = onSafetyClick,
                    modifier = Modifier.testTag("safety_report_btn")
                ) {
                    Icon(
                        imageVector = Icons.Default.Shield,
                        contentDescription = "Safety & Emergency",
                        tint = BrandAccent
                    )
                }

                Spacer(modifier = Modifier.width(4.dp))

                // Role Toggle Chip
                AssistChip(
                    onClick = onRoleClick,
                    label = {
                        Text(
                            text = when (currentRole) {
                                UserRole.CUSTOMER -> "Customer"
                                UserRole.WORKER -> "Pro Mode"
                                UserRole.ADMIN -> "Admin"
                            },
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold
                        )
                    },
                    leadingIcon = {
                        Icon(
                            imageVector = when (currentRole) {
                                UserRole.CUSTOMER -> Icons.Default.Person
                                UserRole.WORKER -> Icons.Default.Build
                                UserRole.ADMIN -> Icons.Default.AdminPanelSettings
                            },
                            contentDescription = null,
                            modifier = Modifier.size(14.dp),
                            tint = when (currentRole) {
                                UserRole.CUSTOMER -> Color.White
                                UserRole.WORKER -> BrandAction
                                UserRole.ADMIN -> Color(0xFFA855F7)
                            }
                        )
                    },
                    colors = AssistChipDefaults.assistChipColors(
                        containerColor = Color(0xFF1E293B),
                        labelColor = Color.White
                    ),
                    border = null,
                    modifier = Modifier.testTag("role_switcher_chip")
                )
            }
        }
    }
}

@Composable
fun VerifiedBadge() {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier
            .clip(RoundedCornerShape(4.dp))
            .background(EmeraldLight)
            .padding(horizontal = 6.dp, vertical = 2.dp)
    ) {
        Icon(
            imageVector = Icons.Default.Verified,
            contentDescription = "Verified",
            tint = EmeraldSuccess,
            modifier = Modifier.size(12.dp)
        )
        Spacer(modifier = Modifier.width(3.dp))
        Text(
            text = "HOMMIE VERIFIED",
            color = EmeraldSuccess,
            fontWeight = FontWeight.Bold,
            fontSize = 9.sp
        )
    }
}

@Composable
fun StarRatingBadge(rating: Double, reviewCount: Int? = null) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier
            .clip(RoundedCornerShape(4.dp))
            .background(AmberLight)
            .padding(horizontal = 6.dp, vertical = 2.dp)
    ) {
        Icon(
            imageVector = Icons.Default.Star,
            contentDescription = null,
            tint = BrandAction,
            modifier = Modifier.size(12.dp)
        )
        Spacer(modifier = Modifier.width(2.dp))
        Text(
            text = "%.1f".format(rating),
            fontWeight = FontWeight.Bold,
            fontSize = 11.sp,
            color = BrandAction
        )
        if (reviewCount != null) {
            Text(
                text = " ($reviewCount)",
                fontSize = 10.sp,
                color = TextSecondary
            )
        }
    }
}

@Composable
fun FairShareGuaranteeCard() {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        colors = CardDefaults.cardColors(containerColor = SurfaceWhite),
        border = CardDefaults.outlinedCardBorder(),
        shape = RoundedCornerShape(14.dp)
    ) {
        Row(
            modifier = Modifier.padding(14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(44.dp)
                    .clip(CircleShape)
                    .background(EmeraldLight),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.Handshake,
                    contentDescription = null,
                    tint = EmeraldSuccess,
                    modifier = Modifier.size(24.dp)
                )
            }
            Spacer(modifier = Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = "Fair Share Marketplace Guarantee",
                    fontWeight = FontWeight.Bold,
                    fontSize = 13.sp,
                    color = TextPrimary
                )
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = "Technicians keep 100% of their service rate. No 25% aggregator commission or hidden cuts.",
                    fontSize = 11.sp,
                    color = TextSecondary,
                    lineHeight = 15.sp
                )
            }
        }
    }
}
