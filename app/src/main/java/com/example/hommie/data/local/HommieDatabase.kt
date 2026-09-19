package com.example.hommie.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase

@Database(
    entities = [BookingEntity::class, HomeAssetEntity::class, AuditLogEntity::class],
    version = 1,
    exportSchema = false
)
abstract class HommieDatabase : RoomDatabase() {
    abstract fun hommieDao(): HommieDao

    companion object {
        @Volatile
        private var INSTANCE: HommieDatabase? = null

        fun getDatabase(context: Context): HommieDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    HommieDatabase::class.java,
                    "hommie_database"
                ).fallbackToDestructiveMigration().build()
                INSTANCE = instance
                instance
            }
        }
    }
}
