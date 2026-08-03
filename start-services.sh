#!/bin/bash
set +e
SUMMARY=/tmp/remesa-services-status.txt
{
  echo "=== $(date -Iseconds) ==="
  ROOT=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 2 http://127.0.0.1:3000/ || echo 000)
  HEALTH=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 2 http://127.0.0.1:3000/health || echo 000)
  echo "pre_backend root=$ROOT health=$HEALTH"
  if [ "$ROOT" = "000" ] && [ "$HEALTH" = "000" ]; then
    echo "starting backend..."
    cd /home/edgar/remesa-blink/backend || exit 1
    CORS_ORIGIN="*" nohup npm run dev > /tmp/remesa-backend-dev.log 2>&1 &
    echo "backend_pid=$!"
    for i in $(seq 1 45); do
      ROOT=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 2 http://127.0.0.1:3000/ || echo 000)
      HEALTH=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 2 http://127.0.0.1:3000/health || echo 000)
      echo "wait $i root=$ROOT health=$HEALTH"
      if [ "$ROOT" != "000" ] || [ "$HEALTH" != "000" ]; then break; fi
      sleep 2
    done
  fi
  ROOT=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 2 http://127.0.0.1:3000/ || echo 000)
  HEALTH=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 2 http://127.0.0.1:3000/health || echo 000)
  echo "BACKEND_HTTP_ROOT=$ROOT"
  echo "BACKEND_HTTP_HEALTH=$HEALTH"
  if [ "$ROOT" = "000" ] && [ "$HEALTH" = "000" ]; then
    echo "=== BACKEND FAIL LOG ==="
    tail -40 /tmp/remesa-backend-dev.log || true
  fi
  echo "starting bot (no reset-auth)..."
  cd /home/edgar/remesa-blink/bot || exit 1
  nohup npm start > /tmp/remesa-bot.log 2>&1 &
  echo "bot_pid=$!"
  for i in $(seq 1 40); do
    if grep -qiE "connection open|connected|QR code|scan the qr|Logged in|authenticated|ready|@s.whatsapp|Bot number|bot number" /tmp/remesa-bot.log 2>/dev/null; then
      echo "bot_log_signal_at_try=$i"
      break
    fi
    sleep 2
  done
  echo "=== BACKEND LOG LAST 15 ==="
  tail -15 /tmp/remesa-backend-dev.log 2>/dev/null || echo "(missing)"
  echo "=== BOT LOG LAST 15 ==="
  tail -15 /tmp/remesa-bot.log 2>/dev/null || echo "(missing)"
  echo "=== BOT STATUS GREP ==="
  grep -iE "open|connected|ready|QR|authenticated|number|logged|session|whatsapp" /tmp/remesa-bot.log 2>/dev/null | tail -40 || true
  cp "$SUMMARY" /home/edgar/remesa-blink/service-status-out.txt 2>/dev/null || true
  echo "DONE_STATUS"
} | tee "$SUMMARY"
cp "$SUMMARY" /home/edgar/remesa-blink/service-status-out.txt 2>/dev/null || true
