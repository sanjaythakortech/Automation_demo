FROM python:3.12-slim

# LibreOffice (Writer only) + fonts for DOCX -> PDF
RUN apt-get update && apt-get install -y --no-install-recommends \
      libreoffice-writer fontconfig fonts-liberation \
      fonts-crosextra-caladea fonts-crosextra-carlito fonts-dejavu-core \
      fonts-noto-core fonts-roboto \
    && rm -rf /var/lib/apt/lists/*

# Fail the build early if LibreOffice is missing
RUN which soffice || ls /usr/lib/libreoffice/program/soffice

# Word font -> metric-compatible font mapping (written inline; no extra file needed)
RUN set -e; { \
      echo '<?xml version="1.0"?>'; \
      echo '<!DOCTYPE fontconfig SYSTEM "fonts.dtd">'; \
      echo '<fontconfig>'; \
      for p in "Cambria:Caladea" "Calibri:Carlito" "Calibri Light:Carlito" \
               "Times New Roman:Liberation Serif" "Arial:Liberation Sans" \
               "Tahoma:Liberation Sans" "Trebuchet MS:Liberation Sans" \
               "Verdana:DejaVu Sans" "Shruti:Noto Sans Gujarati" \
               "Roboto-Regular:Roboto"; do \
        echo "<alias binding=\"same\"><family>${p%%:*}</family><prefer><family>${p#*:}</family></prefer></alias>"; \
      done; \
      echo '</fontconfig>'; \
    } > /etc/fonts/local.conf && fc-cache -f

ENV WEB_MODE=1 PYTHONUNBUFFERED=1 HOME=/tmp
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

CMD gunicorn app:app --bind 0.0.0.0:${PORT:-10000} --workers 1 --threads 2 --timeout 300
