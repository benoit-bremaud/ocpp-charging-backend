#!/bin/bash

###############################################################################
# OCPP Handler Coverage Checker
# 
# Checks which OCPP 1.6 message handlers are implemented in the codebase
# Usage: ./scripts/check-handlers.sh
###############################################################################

# OCPP 1.6 Messages from specification (Section 6)
MESSAGES=(
  "Authorize"
  "BootNotification"
  "CancelReservation"
  "ChangeAvailability"
  "ChangeConfiguration"
  "ClearCache"
  "ClearChargingProfile"
  "DataTransfer"
  "DiagnosticsStatusNotification"
  "FirmwareStatusNotification"
  "GetCompositeSchedule"
  "GetConfiguration"
  "GetDiagnostics"
  "GetLocalListVersion"
  "Heartbeat"
  "MeterValues"
  "RemoteStartTransaction"
  "RemoteStopTransaction"
  "ReserveNow"
  "Reset"
  "SendLocalList"
  "SetChargingProfile"
  "StartTransaction"
  "StatusNotification"
  "StopTransaction"
  "TriggerMessage"
  "UnlockConnector"
  "UpdateFirmware"
)

HANDLERS_DIR="src/application/use-cases"
TOTAL=${#MESSAGES[@]}
FOUND=0
MISSING=()

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔍 OCPP 1.6 Handler Coverage Check${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

for msg in "${MESSAGES[@]}"; do
  HANDLER_FILE="${HANDLERS_DIR}/Handle${msg}.ts"
  SPEC_FILE="${HANDLERS_DIR}/__tests__/Handle${msg}.spec.ts"
  
  if [ -f "$HANDLER_FILE" ] && [ -f "$SPEC_FILE" ]; then
    echo -e "${GREEN}✅${NC} Handle${msg}"
    ((FOUND++))
  elif [ -f "$HANDLER_FILE" ]; then
    echo -e "${YELLOW}⚠️${NC}  Handle${msg} (missing tests)"
    ((FOUND++))
  else
    echo -e "${RED}❌${NC} Handle${msg}"
    MISSING+=("$msg")
  fi
done

PERCENTAGE=$(( FOUND * 100 / TOTAL ))

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 SUMMARY${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Implemented:${NC} $FOUND/$TOTAL ($PERCENTAGE%)"
echo -e "${RED}❌ Missing:${NC}      $((TOTAL - FOUND))/$TOTAL"

if [ ${#MISSING[@]} -gt 0 ]; then
  echo ""
  echo -e "${YELLOW}📋 TODO (Remaining handlers):${NC}"
  for i in "${!MISSING[@]}"; do
    echo "  $((i+1)). Handle${MISSING[$i]}"
  done
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Exit with status code based on completeness
if [ ${#MISSING[@]} -eq 0 ]; then
  echo -e "${GREEN}🎉 All handlers implemented!${NC}\n"
  exit 0
else
  echo -e "${YELLOW}⏳ $((TOTAL - FOUND)) handlers remaining to implement${NC}\n"
  exit 1
fi
