#!/bin/bash

# Script to refresh NBA data cache
# This should be run every 5 minutes via cron

# Load environment variables if needed
if [ -f .env ]; then
  source .env
fi

# API endpoint
API_ENDPOINT="http://localhost:3000/api/cron/refresh-nba"

# Make the API call with internal API key
curl -X POST \
  -H "x-api-key: $INTERNAL_API_KEY" \
  -H "Content-Type: application/json" \
  $API_ENDPOINT

# Log the refresh
echo "$(date): NBA cache refresh completed" >> /var/log/nba-cache-refresh.log
