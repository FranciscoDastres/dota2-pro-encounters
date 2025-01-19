#!/bin/bash

OUTPUT_CSV="./api_output.csv"
ACCOUNT_ID="$1" #guarda el account_id desde la request del front.
API_URL="https://api.opendota.com/api/players/${ACCOUNT_ID}/pros"

echo -e "API URL: \n$API_URL"

RESPONSE=$(curl -s -X GET "$API_URL" -H "Accept: application/json")
touch $OUTPUT_CSV
echo "avatarfull, account_id,profileurl,personaname,team_name,last_match_time,games,win,country_code" > $OUTPUT_CSV
echo "${RESPONSE}" | jq -r '.[] | [.avatarfull, .account_id, .profileurl, .personaname, .team_name, .last_match_time, .games, .win, .country_code] | @csv' >> $OUTPUT_CSV

echo "avatarfull,account_id,profileurl,personaname,team_name,last_match_time,games,win,country_code"

#pwd > "./log.txt"

sh ./src/generate_table.sh
