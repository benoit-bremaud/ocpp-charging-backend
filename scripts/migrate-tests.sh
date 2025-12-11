#!/bin/bash

# 🚀 SCRIPT MIGRATION AUTOMATIQUE - Centraliser tous les tests
# Usage: bash migrate-tests.sh

set -e  # Exit on error

echo "🚀 Démarrage migration tests centralisée..."
echo ""

# ============================================================================
# ÉTAPE 1: Créer la structure complète
# ============================================================================
echo "📁 ÉTAPE 1: Créer structure répertoires..."

mkdir -p tests/{unit,integration,e2e}/{application,domain,infrastructure,presentation}
mkdir -p tests/unit/application/{dto,use-cases,mappers,orchestrators,services}
mkdir -p tests/unit/application/use-cases/handlers
mkdir -p tests/unit/application/dto/{input,output}
mkdir -p tests/unit/domain/{entities,enums,value-objects,repositories,ocpp-messages}
mkdir -p tests/unit/domain/enums/{auth,charging,configuration,control,data-transfer,firmware,metering,other,status,transactions}
mkdir -p tests/unit/domain/value-objects/{OcppIdentifiers,OcppMeasurements,OcppString}
mkdir -p tests/unit/infrastructure/{database,health,repositories,websocket}
mkdir -p tests/unit/presentation/controllers
mkdir -p tests/integration/{ocpp-message-cycle,websocket,database,repositories}
mkdir -p tests/e2e
mkdir -p tests/{fixtures,helpers}

echo "✅ Structure créée"
echo ""

# ============================================================================
# ÉTAPE 2: Fonction helper pour déplacer fichiers
# ============================================================================

move_test_file() {
    local src_path="$1"
    local dest_dir="$2"
    
    if [ -f "$src_path" ]; then
        local filename=$(basename "$src_path")
        mkdir -p "$dest_dir"
        mv "$src_path" "$dest_dir/$filename"
        echo "  ✓ $filename → $dest_dir/"
    fi
}

# ============================================================================
# ÉTAPE 3: Déplacer les tests APPLICATION
# ============================================================================
echo "📦 ÉTAPE 2: Migrer tests APPLICATION..."

# DTO Input
for file in src/application/dto/input/__tests__/*.spec.ts; do
    [ -f "$file" ] && move_test_file "$file" "tests/unit/application/dto/input"
done

# DTO Output
for file in src/application/dto/output/__tests__/*.spec.ts; do
    [ -f "$file" ] && move_test_file "$file" "tests/unit/application/dto/output"
done

# Use Cases (Handlers)
for file in src/application/use-cases/__tests__/Handle*.spec.ts; do
    [ -f "$file" ] && move_test_file "$file" "tests/unit/application/use-cases/handlers"
done

# Use Cases (Autres)
for file in src/application/use-cases/__tests__/*.spec.ts; do
    [ -f "$file" ] && move_test_file "$file" "tests/unit/application/use-cases"
done

# Mappers
for file in src/application/mappers/__tests__/*.spec.ts; do
    [ -f "$file" ] && move_test_file "$file" "tests/unit/application/mappers"
done

# Orchestrators
for file in src/application/orchestrators/__tests__/*.spec.ts; do
    [ -f "$file" ] && move_test_file "$file" "tests/unit/application/orchestrators"
done

# Services
for file in src/application/services/__tests__/*.spec.ts; do
    [ -f "$file" ] && move_test_file "$file" "tests/unit/application/services"
done

echo "✅ Tests APPLICATION migrés"
echo ""

# ============================================================================
# ÉTAPE 4: Déplacer les tests DOMAIN
# ============================================================================
echo "🧬 ÉTAPE 3: Migrer tests DOMAIN..."

# Entities
for file in src/domain/entities/**/__tests__/*.spec.ts; do
    [ -f "$file" ] && move_test_file "$file" "tests/unit/domain/entities"
done

# Enums
for file in src/domain/enums/**/__tests__/*.spec.ts; do
    [ -f "$file" ] && {
        filename=$(basename "$file")
        subdir=$(basename $(dirname $(dirname "$file")))
        mkdir -p "tests/unit/domain/enums/$subdir"
        mv "$file" "tests/unit/domain/enums/$subdir/$filename"
        echo "  ✓ $filename → tests/unit/domain/enums/$subdir/"
    }
done

# Value Objects
for file in src/domain/value-objects/__tests__/*.spec.ts; do
    [ -f "$file" ] && move_test_file "$file" "tests/unit/domain/value-objects"
done

# Value Objects - OcppString
for file in src/domain/value-objects/OcppString/__tests__/*.spec.ts; do
    [ -f "$file" ] && move_test_file "$file" "tests/unit/domain/value-objects/OcppString"
done

# Value Objects - OcppIdentifiers
for file in src/domain/value-objects/OcppIdentifiers/__tests__/*.spec.ts; do
    [ -f "$file" ] && move_test_file "$file" "tests/unit/domain/value-objects/OcppIdentifiers"
done

# Value Objects - OcppMeasurements
for file in src/domain/value-objects/OcppMeasurements/__tests__/*.spec.ts; do
    [ -f "$file" ] && move_test_file "$file" "tests/unit/domain/value-objects/OcppMeasurements"
done

# OCPP Messages
for file in src/domain/ocpp-messages/__tests__/*.spec.ts; do
    [ -f "$file" ] && move_test_file "$file" "tests/unit/domain/ocpp-messages"
done

echo "✅ Tests DOMAIN migrés"
echo ""

# ============================================================================
# ÉTAPE 5: Déplacer les tests INFRASTRUCTURE
# ============================================================================
echo "🏗️ ÉTAPE 4: Migrer tests INFRASTRUCTURE..."

# Health
for file in src/infrastructure/health/__tests__/*.spec.ts; do
    [ -f "$file" ] && move_test_file "$file" "tests/unit/infrastructure/health"
done

# Repositories - Unit
for file in src/infrastructure/repositories/__tests__/*unit*.spec.ts; do
    [ -f "$file" ] && move_test_file "$file" "tests/unit/infrastructure/repositories"
done

# Repositories - Integration
for file in src/infrastructure/repositories/__tests__/*integration*.spec.ts; do
    [ -f "$file" ] && move_test_file "$file" "tests/integration/repositories"
done

# WebSocket - Unit
for file in src/infrastructure/websocket/__tests__/*unit*.spec.ts; do
    [ -f "$file" ] && move_test_file "$file" "tests/unit/infrastructure/websocket"
done

# WebSocket - Integration
for file in src/infrastructure/websocket/__tests__/*integration*.spec.ts; do
    [ -f "$file" ] && move_test_file "$file" "tests/integration/websocket"
done

echo "✅ Tests INFRASTRUCTURE migrés"
echo ""

# ============================================================================
# ÉTAPE 6: Déplacer les tests PRESENTATION
# ============================================================================
echo "🎨 ÉTAPE 5: Migrer tests PRESENTATION..."

# Controllers - Unit
for file in src/presentation/controllers/__tests__/*.spec.ts; do
    [ -f "$file" ] && {
        if [[ "$file" == *"e2e"* ]]; then
            move_test_file "$file" "tests/e2e"
        else
            move_test_file "$file" "tests/unit/presentation/controllers"
        fi
    }
done

echo "✅ Tests PRESENTATION migrés"
echo ""

# ============================================================================
# ÉTAPE 7: Test root level
# ============================================================================
echo "📄 ÉTAPE 6: Migrer test root..."

[ -f "src/app.controller.spec.ts" ] && move_test_file "src/app.controller.spec.ts" "tests/unit"

echo "✅ Tests root migrés"
echo ""

# ============================================================================
# ÉTAPE 8: Nettoyer les anciens répertoires __tests__
# ============================================================================
echo "🧹 ÉTAPE 7: Nettoyer anciens répertoires __tests__..."

find src -type d -name "__tests__" -exec rm -rf {} + 2>/dev/null || true

echo "✅ Répertoires __tests__ supprimés"
echo ""

# ============================================================================
# ÉTAPE 9: Mettre à jour les imports (sed)
# ============================================================================
echo "🔄 ÉTAPE 8: Adapter imports (cela peut prendre un moment)..."

# Fonction pour adapter les imports dans un fichier
update_imports() {
    local file="$1"
    
    # Remplacer les chemins relatifs compliqués par @src/
    sed -i "s|from '[\.\/]*\.\.\/\.\.\/\.\.\/|from '@src/|g" "$file"
    sed -i "s|from '[\.\/]*\.\.\/\.\.\/|from '@src/|g" "$file"
    sed -i "s|from '[\.\/]*\.\.\/|from '@src/|g" "$file"
    sed -i "s|from \"[\.\/]*\.\.\/\.\.\/\.\.\/|from \"@src/|g" "$file"
    sed -i "s|from \"[\.\/]*\.\.\/\.\.\/|from \"@src/|g" "$file"
    sed -i "s|from \"[\.\/]*\.\.\/|from \"@src/|g" "$file"
}

# Appliquer à tous les fichiers test
find tests -name "*.spec.ts" | while read file; do
    update_imports "$file"
done

echo "✅ Imports adaptés"
echo ""

# ============================================================================
# ÉTAPE 10: Vérifications
# ============================================================================
echo "✅ ÉTAPE 9: Vérifications..."

# Compter les fichiers migrés
test_count=$(find tests -name "*.spec.ts" | wc -l)
echo "  📊 Nombre de tests migrés: $test_count"

# Vérifier qu'il n'y a plus de .spec.ts dans src/
src_tests=$(find src -name "*.spec.ts" 2>/dev/null | wc -l)
if [ "$src_tests" -eq 0 ]; then
    echo "  ✅ Aucun .spec.ts dans src/ (OK)"
else
    echo "  ⚠️  Attention: $src_tests fichiers .spec.ts restent dans src/"
fi

# Vérifier qu'il n'y a plus de __tests__/ dans src/
tests_dirs=$(find src -type d -name "__tests__" 2>/dev/null | wc -l)
if [ "$tests_dirs" -eq 0 ]; then
    echo "  ✅ Aucun répertoire __tests__/ dans src/ (OK)"
else
    echo "  ⚠️  Attention: $tests_dirs répertoires __tests__/ restent dans src/"
fi

echo ""
echo "✅ MIGRATION COMPLÉTÉE!"
echo ""
echo "📋 Prochaines étapes:"
echo "  1. Vérifier les imports: find tests -name '*.spec.ts' | head -5"
echo "  2. npm install (si besoin)"
echo "  3. npm test (pour valider)"
echo "  4. npm run build:prod (build sans tests)"
echo "  5. git add . && git commit"