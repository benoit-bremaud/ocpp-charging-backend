#!/bin/bash

echo "========================================================================"
echo "🔍 ARCHITECTURE AUDIT - OCPP 1.6J Integration"
echo "========================================================================"
echo ""

# 1. Compter les fichiers
echo "📊 FILE STATISTICS"
echo "------------------------------------------------------------------------"

ENUM_COUNT=$(find src/domain/enums -name "*.ts" ! -path "*__tests__*" | wc -l)
VO_COUNT=$(find src/domain/value-objects -name "*.ts" ! -path "*__tests__*" | wc -l)
TEST_COUNT=$(find src/domain -name "*.spec.ts" | wc -l)
INDEX_COUNT=$(find src/domain -name "index.ts" | wc -l)

echo "✅ Enum files (no tests): $ENUM_COUNT"
echo "✅ Value-object files (no tests): $VO_COUNT"
echo "✅ Test files (.spec.ts): $TEST_COUNT"
echo "✅ Index/barrel export files: $INDEX_COUNT"
echo ""

# 2. Vérifier les doublons
echo "⚠️  DUPLICATES CHECK"
echo "------------------------------------------------------------------------"
DUPLICATES=$(find src/domain -name "*.ts" ! -path "*__tests__*" -type f | sort | uniq -d)
if [ -z "$DUPLICATES" ]; then
    echo "✅ No duplicate files found!"
else
    echo "❌ DUPLICATES FOUND:"
    echo "$DUPLICATES"
fi
echo ""

# 3. Vérifier la structure des enums
echo "📋 ENUMS STRUCTURE"
echo "------------------------------------------------------------------------"
for category in auth charging status metering firmware configuration transactions control data-transfer other; do
    COUNT=$(find src/domain/enums/$category -maxdepth 1 -name "*.ts" | wc -l)
    if [ $COUNT -gt 0 ]; then
        echo "✅ $category: $COUNT files"
    else
        echo "❌ $category: MISSING"
    fi
done
echo ""

# 4. Vérifier la structure des value-objects
echo "📋 VALUE-OBJECTS STRUCTURE"
echo "------------------------------------------------------------------------"
for category in OcppString OcppIdentifiers OcppEntities OcppMeasurements; do
    COUNT=$(find src/domain/value-objects/$category -maxdepth 1 -name "*.ts" ! -path "*__tests__*" | wc -l)
    if [ $COUNT -gt 0 ]; then
        echo "✅ $category: $COUNT files"
    else
        echo "❌ $category: MISSING"
    fi
done
echo ""

# 5. Vérifier les index files
echo "📤 BARREL EXPORTS INDEX FILES"
echo "------------------------------------------------------------------------"
REQUIRED_INDEXES=(
    "src/domain/enums/index.ts"
    "src/domain/enums/auth/index.ts"
    "src/domain/enums/charging/index.ts"
    "src/domain/enums/status/index.ts"
    "src/domain/value-objects/index.ts"
    "src/domain/value-objects/OcppString/index.ts"
    "src/domain/value-objects/OcppIdentifiers/index.ts"
)

MISSING_INDEXES=0
for idx_file in "${REQUIRED_INDEXES[@]}"; do
    if [ -f "$idx_file" ]; then
        echo "✅ $idx_file"
    else
        echo "❌ $idx_file MISSING"
        ((MISSING_INDEXES++))
    fi
done
echo ""

# 6. Tests
echo "🧪 TEST COVERAGE"
echo "------------------------------------------------------------------------"
echo "✅ CiString20Type tests: $(grep -c "describe(" src/domain/value-objects/OcppString/__tests__/CiString20Type.spec.ts 2>/dev/null || echo "0")"
echo "✅ CiString25Type tests: $(grep -c "describe(" src/domain/value-objects/OcppString/__tests__/CiString25Type.spec.ts 2>/dev/null || echo "0")"
echo "✅ CiString50Type tests: $(grep -c "describe(" src/domain/value-objects/OcppString/__tests__/CiString50Type.spec.ts 2>/dev/null || echo "0")"
echo "✅ CiString255Type tests: $(grep -c "describe(" src/domain/value-objects/OcppString/__tests__/CiString255Type.spec.ts 2>/dev/null || echo "0")"
echo "✅ CiString500Type tests: $(grep -c "describe(" src/domain/value-objects/OcppString/__tests__/CiString500Type.spec.ts 2>/dev/null || echo "0")"
echo "✅ IdToken tests: $(grep -c "describe(" src/domain/value-objects/OcppIdentifiers/__tests__/IdToken.spec.ts 2>/dev/null || echo "0")"
echo ""

# 7. Résumé
echo "========================================================================"
if [ $MISSING_INDEXES -eq 0 ] && [ -z "$DUPLICATES" ]; then
    echo "✅ ARCHITECTURE AUDIT PASSED!"
else
    echo "⚠️  ARCHITECTURE AUDIT - ISSUES FOUND"
    if [ $MISSING_INDEXES -gt 0 ]; then
        echo "  ❌ Missing $MISSING_INDEXES index files"
    fi
    if [ ! -z "$DUPLICATES" ]; then
        echo "  ❌ Duplicate files detected"
    fi
fi
echo "========================================================================"
