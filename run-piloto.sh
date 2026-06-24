#!/bin/bash
printf '%s' '{"whatsapp":"+15550009999","rol":"remitente","nombre_opcional":"Test Cursor","notas":"health-check-temp"}' > /tmp/piloto.json
(cd /home/edgar/remesa-blink/backend && npx tsx src/index.ts >> /tmp/backend-dev.log 2>&1 &)
sleep 7
curl -s -w "\nHTTP:%{http_code}\n" -X POST http://127.0.0.1:3000/api/pilotos -H "Content-Type: application/json" -d @/tmp/piloto.json
