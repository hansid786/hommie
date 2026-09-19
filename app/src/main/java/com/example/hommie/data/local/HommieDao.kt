package com.example.hommie.data.local

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface HommieDao {
    @Query("SELECT * FROM cached_bookings ORDER BY createdAt DESC")
    fun getAllBookings(): Flow<List<BookingEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertBooking(booking: BookingEntity)

    @Query("SELECT * FROM cached_assets")
    fun getAllAssets(): Flow<List<HomeAssetEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAsset(asset: HomeAssetEntity)

    @Query("DELETE FROM cached_assets WHERE id = :id")
    suspend fun deleteAsset(id: String)

    @Query("SELECT * FROM cached_logs ORDER BY timestamp DESC")
    fun getAllLogs(): Flow<List<AuditLogEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertLog(log: AuditLogEntity)
}
