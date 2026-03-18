# E-shop — Semestrální práce

Next.js 14 e-shop aplikace s kompletní TDD metodologií, REST API, Prisma ORM a CI/CD pipeline.

## Doménový model a business pravidla

### Entity

| Entita      | Klíčové atributy |
|-------------|-----------------|
| Product     | id, name, description, price, stockQty, category |
| Order       | id, status (NEW->PAID->SHIPPED->DELIVERED), userId, totalPrice, discountCode |
| OrderItem   | id, orderId, productId, quantity, unitPrice |
| Discount    | id, code, type (PERCENT/FIXED), value, minOrderAmount, validFrom, validTo |

### Business pravidla

1. **Stavový automat** - povoleny POUZE: NEW -> PAID -> SHIPPED -> DELIVERED
2. **Výpočet ceny se slevou** - PERCENT/FIXED, s validací data a minOrderAmount
3. **Kontrola skladu** - nelze přidat položku pokud stockQty < quantity; po PAID se odečte
4. **Idempotence platby** - PAID/SHIPPED/DELIVERED nelze znovu zaplatit
5. **Validace produktu** - neexistující produkt = 404; stockQty = 0 nelze přidat

---

## Architektura

```
Klient (HTTP)
     |
Next.js API Routes (app/api/)
     |
Services (src/services/)
     |              |
Domain (src/domain/) Repositories (src/repositories/)
                          |
                    Prisma ORM + PostgreSQL
```

**Vrstvová architektura**: API Route -> Service -> Repository -> Prisma -> PostgreSQL.
Doménová logika je izolovaná v `domain/` bez závislostí - umoznuje ciste unit testovani.

---

## Spuštění lokálně

### Varianta 1: npm

```bash
cd eshop
npm install
npx prisma migrate deploy
npm run dev   # http://localhost:3000
```

### Varianta 2: Docker Compose (doporučeno)

```bash
docker compose up --build
```

### Varianta 3: Kubernetes (minikube)

```bash
minikube start
eval $(minikube docker-env)
docker build -t eshop:latest .
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
# Přidat do /etc/hosts: $(minikube ip) eshop.local
```

---

## Testovací strategie

### Jednotkové testy (`__tests__/unit/`)

- Testuje: doménová logika v `src/domain/` - stavový automat, slevy, sklad, validace
- Mockuje: časové závislosti (validFrom/validTo) jsou vstupem funkce
- Struktura: AAA (Arrange, Act, Assert) + describe bloky pro každé pravidlo

```bash
npm run test:unit
```

### Integrační testy (`__tests__/integration/`)

- Testuje: celý HTTP požadavek (Supertest -> route -> service -> Prisma -> PostgreSQL)
- Vyžaduje: PostgreSQL na localhost:5432 (nebo Docker)

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/eshop_test npm run test:integration
```

### Coverage

```bash
npm run test:coverage   # cíl: >= 70% line, >= 50% branch
```

---

## CI/CD Pipeline (GitHub Actions)

| Job | Akce |
|-----|------|
| unit-tests | npm ci -> test:unit |
| integration-tests | PostgreSQL service -> prisma migrate -> test:integration |
| coverage | test:coverage -> artefakt HTML report |
| docker-build | docker build (závisí na unit-tests) |

---

## REST API

| Method | Endpoint | Popis |
|--------|----------|-------|
| GET | `/api/products` | Seznam (volitelně ?category=X) |
| POST | `/api/products` | Vytvoření produktu |
| GET | `/api/products/[id]` | Detail produktu |
| PATCH | `/api/products/[id]` | Aktualizace skladu |
| GET | `/api/orders` | Seznam objednávek |
| POST | `/api/orders` | Vytvoření objednávky |
| GET | `/api/orders/[id]` | Detail s položkami |
| POST | `/api/orders/[id]/pay` | Zaplacení (NEW -> PAID) |
| POST | `/api/orders/[id]/ship` | Odeslání (PAID -> SHIPPED) |
| POST | `/api/orders/[id]/deliver` | Doručení (SHIPPED -> DELIVERED) |
| POST | `/api/discounts` | Vytvoření slevového kódu |
| GET | `/api/discounts/[code]` | Ověření platnosti |
