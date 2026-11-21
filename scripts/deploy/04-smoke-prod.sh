#!/usr/bin/env bash
# Tests smoke production HTTPS
set -euo pipefail

DOMAIN="${1:?Usage: $0 <domain>}"
BASE="https://${DOMAIN}"

fail=0
check() {
  local path="$1"
  local code
  code=$(curl -sk -o /dev/null -w "%{http_code}" "${BASE}${path}")
  if [[ "${code}" == "200" ]]; then
    echo "OK  ${code} ${path}"
  else
    echo "FAIL ${code} ${path}"
    fail=1
  fi
}

echo "=== Smoke ${BASE} ==="
check "/"
check "/a-propos"
check "/materiaux"
check "/realisations"
check "/contact"
check "/robots.txt"
check "/sitemap.xml"
check "/images/hero/hero-camion.jpg"
check "/images/materials/sable.jpg"

# SEO / brand — ne doit PAS servir ecom-touch par erreur (SNI / default SSL)
html=$(curl -sk "${BASE}/")
if echo "$html" | grep -qi 'ECOM-TOUCH\|ecom-touch\.tech'; then
  echo "FAIL site renvoie ECOM-TOUCH (vhost SSL par défaut / SNI) — vhost narahservice manquant ou cert incorrect"
  fail=1
fi
echo "$html" | grep -qi 'NARAH SERVICE' && echo "OK  brand present" || { echo "FAIL brand"; fail=1; }
echo "$html" | grep -qi 'Welcome to nginx' && { echo "FAIL welcome nginx"; fail=1; } || true
echo "$html" | grep -qi 'application/ld+json' && echo "OK  json-ld" || { echo "FAIL json-ld"; fail=1; }

# Form API without SMTP should be explicit 503 (not fake success)
api=$(curl -sk -o /tmp/narah-api.json -w "%{http_code}" -X POST "${BASE}/api/devis" \
  -H 'Content-Type: application/json' \
  -d '{"fullName":"Test Prod","phone":"78000000","material":"sable","quantity":"1","deliveryLocation":"Ouaga","consent":true,"website":""}')
echo "API devis HTTP ${api} body=$(head -c 200 /tmp/narah-api.json)"
if [[ "${api}" == "503" || "${api}" == "200" ]]; then
  echo "OK  api responded (${api})"
else
  echo "FAIL unexpected api ${api}"
  fail=1
fi

# Existing site still up
if curl -sk -o /dev/null -w "%{http_code}" "https://ecom-touch.tech/" | grep -qE '200|301|302'; then
  echo "OK  ecom-touch.tech still responding"
else
  echo "FAIL ecom-touch.tech may be impacted"
  fail=1
fi

exit "${fail}"
