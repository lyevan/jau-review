#!/bin/bash

# Load environment variables
set -a
source .env
set +a

# Extract database connection details from DATABASE_URL
# Format: postgresql://user:password@host:port/database
DB_URL=${DATABASE_URL}

echo "🔄 Running database migration for visits tables..."

# Run the migration
psql ${DB_URL} -f migrations/create_visits_tables.sql

if [ $? -eq 0 ]; then
    echo "✅ Migration completed successfully!"
else
    echo "❌ Migration failed!"
    exit 1
fi
