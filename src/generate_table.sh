#!/bin/bash

# Paths to the input and output files
PLAYERS_INPUT_FILE="./api_output.csv"
HTML_OUTPUT_FILE="./output_table.html"

# Start HTML output
{
  # echo "<html>"
  # echo "<head><title>Pros Played With</title></head>"
  # echo "<body>"
  # echo "<h3>Pros Played With</h3>"
  echo "<table border='1' cellpadding='5' cellspacing='0'>"
} > "${HTML_OUTPUT_FILE}"

# Read the CSV file
{
  read -r header_line
  # Process header
  IFS=',' read -ra headers <<< "$header_line"
  echo "<tr style='font-weight:bold'>" >> "${HTML_OUTPUT_FILE}"
  for header in "${headers[@]}"; do
    # Remove quotes and add header
    clean_header="${header//\"/}"

    if [[ "$clean_header" == "personaname" ]]; then
      continue
    fi

    echo "<th>${clean_header}</th>" >> "${HTML_OUTPUT_FILE}"


  done
  echo "</tr>" >> "${HTML_OUTPUT_FILE}"

  # Process data rows
  while read -r line; do
    # Parse the row
    IFS=',' read -ra columns <<< "$line"
    echo "<tr>" >> "${HTML_OUTPUT_FILE}"
    for ((i = 0; i < ${#columns[@]}; i++)); do
      # Remove quotes from fields
      clean_column="${columns[$i]//\"/}"
      if [[ "${headers[$i]}" == "profileurl" ]]; then
        # Create link for profileurl with personaname as text
        personaname="${columns[$((i + 1))]//\"/}"

        echo "<td><a href='${clean_column}' target='_blank'>${personaname}</a></td>" >> "${HTML_OUTPUT_FILE}"
      elif [[ "${headers[$i]}" == "personaname" ]]; then
        # Skip personaname since it's included in the profileurl link
        continue
      elif [[ "${headers[$i]}" == "avatarfull" ]]; then
        echo "<td><img src='${clean_column}' ></td>" >> "${HTML_OUTPUT_FILE}"
      else
        echo "<td>${clean_column}</td>" >> "${HTML_OUTPUT_FILE}"
      fi
    done
    echo "</tr>" >> "${HTML_OUTPUT_FILE}"
  done
} < "${PLAYERS_INPUT_FILE}"

# End HTML output
{
  echo "</table>"
  # echo "</body>"
  # echo "</html>"
} >> "${HTML_OUTPUT_FILE}"
