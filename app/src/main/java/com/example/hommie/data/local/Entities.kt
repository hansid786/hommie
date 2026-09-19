package com.example.hommie.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "cached_bookings")
data class BookingEntity(
    @PrimaryKey val id: String,
    val bookingRef: String,
    val customerName: String,
    val workerName: String,
    val serviceTitle: String,
    val finalAmount: Int,
    val status: String,
    val createdAt: String
)

@Entity(tableName = "cached_assets")
data class HomeAssetEntity(
    @PrimaryKey val id: String,
    val name: String,
    val category: String,
    val brand: String,
    val locationRoom: String,
    val nextDueReminderDate: String,
    val status: String
)

@Entity(tableName = "cached_logs")
data class AuditLogEntity(
    @PrimaryKey val id: String,
    val timestamp: String,
    val actor: String,
    val action: String,
    val details: String
)
