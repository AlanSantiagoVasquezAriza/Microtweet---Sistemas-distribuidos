# 🐦 Microtweet - Arquitectura de Microservicios

Sistema de microblogging distribuido construido con microservicios en Node.js, PostgreSQL y Redis.

## 📋 Tabla de Contenidos

- [Arquitectura](#arquitectura)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Configuración](#configuración)
- [Ejecución](#ejecución)
- [Testing de Endpoints](#testing-de-endpoints)
- [Troubleshooting](#troubleshooting)

## 🏗️ Arquitectura

El sistema está compuesto por 5 microservicios:

```
                    ┌─────────────────┐
                    │   API Gateway   │ :3000
                    │  (Punto Único)  │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
    ┌───▼───┐         ┌──────▼──────┐      ┌─────▼─────┐
    │ Auth  │         │    User     │      │   Tweet   │
    │Service│         │   Service   │      │  Service  │
    │ :3001 │         │    :3002    │      │   :3003   │
    └───┬───┘         └──────┬──────┘      └─────┬─────┘
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
                      ┌──────▼──────┐
                      │    Feed     │
                      │   Service   │
                      │    :3004    │
                      └──────┬──────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
        ┌─────▼─────┐               ┌───────▼───────┐
       │PostgreSQL │               │     Redis     │
       │   :5432   │               │  :6380 → 6379 │
        └───────────┘               └───────────────┘
```

### Servicios

1. **Auth Service** (Puerto 3001)
   - Registro y login de usuarios
   - Generación y verificación de tokens JWT
   - Base de datos: PostgreSQL (tabla `users`)

2. **User Service** (Puerto 3002)
   - Gestión de perfiles de usuario
   - Sistema de follows/unfollows
   - Consulta de seguidores y seguidos
   - Base de datos: PostgreSQL (tablas `users`, `follows`)

3. **Tweet Service** (Puerto 3003)
   - Creación, edición y eliminación de tweets
   - Consulta de tweets individuales
   - Validación de autoría
   - Base de datos: PostgreSQL (tabla `tweets`)
   - Cache: Redis (invalidación)

4. **Feed Service** (Puerto 3004)
   - Agregación de feeds público y personalizado
   - Sistema de caché con Redis
   - Consulta optimizada de tweets
   - Base de datos: PostgreSQL (lectura)
   - Cache: Redis (feeds)

5. **API Gateway** (Puerto 3000)
   - Punto de entrada único
   - Enrutamiento a microservicios
   - Autenticación global
   - Proxy reverso

## 📦 Requisitos Previos

- **Docker** (versión 20.x o superior)
- **Docker Compose** (versión 2.x o superior)
- **Node.js** 18+ (solo para desarrollo local sin Docker)
- **Git**

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/microtweet.git
cd microtweet
```

### 2. Crear archivos de configuración

Crea un archivo `.env` en la raíz del proyecto:

```bash
# .env
JWT_SECRET=tu-secreto-jwt-super-seguro-cambiar-en-produccion
JWT_EXPIRES_IN=7d

DB_HOST=postgres
DB_PORT=5432
DB_NAME=microtweet_db
DB_USER=microtweet
DB_PASSWORD=microtweet123

REDIS_HOST=redis
REDIS_PORT=6379
```

### 3. Verificar estructura de carpetas

Asegúrate de tener la siguiente estructura:

```
microtweet/
├── docker-compose.yml
├── .env
├── scripts/
│   └── init-db.sql
├── api-gateway/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
├── auth-service/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
├── user-service/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
├── tweet-service/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
└── feed-service/
    ├── Dockerfile
    ├── package.json
    └── src/
```

## ▶️ Ejecución

### Levantar todos los servicios

```bash
# Construir imágenes y levantar servicios
docker-compose up --build -d

# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f api-gateway
```

### Verificar que todo esté funcionando

```bash
# Verificar servicios corriendo
docker-compose ps

# Deberías ver algo como:
# NAME                  STATUS              PORTS
# api-gateway           Up                  0.0.0.0:3000->3000/tcp
# auth-service          Up                  0.0.0.0:3001->3001/tcp
# user-service          Up                  0.0.0.0:3002->3002/tcp
# tweet-service         Up                  0.0.0.0:3003->3003/tcp
# feed-service          Up                  0.0.0.0:3004->3004/tcp
# microtweet-postgres   Up                  0.0.0.0:5432->5432/tcp
# microtweet-redis      Up                  0.0.0.0:6380->6379/tcp
```

### Health checks

```bash
# API Gateway
curl http://localhost:3000/health

# Auth Service
curl http://localhost:3001/health

# User Service
curl http://localhost:3002/health

# Tweet Service
curl http://localhost:3003/health

# Feed Service
curl http://localhost:3004/health
```

## 🖥️ Frontend básico

Incluimos un cliente estático muy sencillo en `frontend/` para probar la plataforma sin usar cURL.

```bash
# 1. Arranca los microservicios (si aún no lo hiciste)
docker-compose up -d

# 2. Sirve los archivos estáticos (elige una opción)
cd frontend
python -m http.server 5173
# o con Node:
# npx serve .
```

Luego abre http://localhost:5173 (o el puerto que hayas elegido). Desde la esquina superior derecha puedes cambiar la URL del API Gateway si no estás usando `http://localhost:3000`.

## 🧪 Testing de Endpoints

### 1. Registro de Usuario

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123",
    "bio": "Software developer"
  }'
```

Respuesta esperada:
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "bio": "Software developer"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Guarda el token** que recibes en la respuesta para usarlo en las siguientes peticiones.

### 3. Ver Perfil de Usuario

```bash
curl http://localhost:3000/api/users/1
```

### 4. Actualizar Perfil (requiere autenticación)

```bash
TOKEN="tu-token-aqui"

curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "bio": "Full stack developer | Tech enthusiast"
  }'
```

### 5. Seguir a un Usuario

```bash
curl -X POST http://localhost:3000/api/users/2/follow \
  -H "Authorization: Bearer $TOKEN"
```

### 6. Crear un Tweet

```bash
curl -X POST http://localhost:3000/api/tweets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "content": "¡Mi primer tweet en Microtweet! 🚀"
  }'
```

### 7. Ver un Tweet

```bash
curl http://localhost:3000/api/tweets/1
```

### 8. Editar un Tweet (solo el autor)

```bash
curl -X PUT http://localhost:3000/api/tweets/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "content": "Tweet editado con nuevo contenido"
  }'
```

### 9. Eliminar un Tweet (solo el autor)

```bash
curl -X DELETE http://localhost:3000/api/tweets/1 \
  -H "Authorization: Bearer $TOKEN"
```

### 10. Ver Feed Público (todos los tweets)

```bash
curl "http://localhost:3000/api/feeds/public?page=1&limit=20"
```

### 11. Ver Feed Personalizado (tweets de usuarios seguidos)

```bash
curl "http://localhost:3000/api/feeds/personal/1?page=1&limit=20" \
  -H "Authorization: Bearer $TOKEN"
```

### 12. Ver Seguidores de un Usuario

```bash
curl "http://localhost:3000/api/users/1/followers?page=1&limit=20"
```

### 13. Ver Usuarios Seguidos

```bash
curl "http://localhost:3000/api/users/1/following?page=1&limit=20"
```

## 🐛 Troubleshooting

### Los contenedores no inician

```bash
# Ver logs detallados
docker-compose logs

# Reiniciar servicios
docker-compose down
docker-compose up --build
```

### Error de conexión a la base de datos

```bash
# Verificar que PostgreSQL esté corriendo
docker-compose ps postgres

# Ver logs de PostgreSQL
docker-compose logs postgres

# Conectarse manualmente a PostgreSQL
docker exec -it microtweet-postgres psql -U microtweet -d microtweet_db
```

### Error de conexión a Redis

```bash
# Verificar Redis
docker-compose ps redis

# Conectarse a Redis CLI
docker exec -it microtweet-redis redis-cli
```

### Limpiar todo y empezar de nuevo

```bash
# Detener y eliminar todo
docker-compose down -v

# Eliminar imágenes
docker-compose down --rmi all

# Rebuild completo
docker-compose up --build
```

### Ver logs de un servicio específico

```bash
docker-compose logs -f auth-service
docker-compose logs -f user-service
docker-compose logs -f tweet-service
docker-compose logs -f feed-service
docker-compose logs -f api-gateway
```

## 🛠️ Desarrollo Local (sin Docker)

Si prefieres desarrollar sin Docker:

### 1. Instalar PostgreSQL y Redis localmente

### 2. Crear base de datos

```bash
psql -U postgres
CREATE DATABASE microtweet_db;
CREATE USER microtweet WITH PASSWORD 'microtweet123';
GRANT ALL PRIVILEGES ON DATABASE microtweet_db TO microtweet;
```

### 3. Ejecutar script de inicialización

```bash
psql -U microtweet -d microtweet_db -f scripts/init-db.sql
```

### 4. Instalar dependencias en cada servicio

```bash
cd auth-service && npm install
cd ../user-service && npm install
cd ../tweet-service && npm install
cd ../feed-service && npm install
cd ../api-gateway && npm install
```

### 5. Iniciar cada servicio en terminales separadas

```bash
# Terminal 1
cd auth-service && npm run dev

# Terminal 2
cd user-service && npm run dev

# Terminal 3
cd tweet-service && npm run dev

# Terminal 4
cd feed-service && npm run dev

# Terminal 5
cd api-gateway && npm run dev
```

## 📚 Próximos Pasos

- [ ] Agregar sistema de likes y retweets
- [ ] Implementar búsqueda de tweets
- [ ] Agregar notificaciones en tiempo real (WebSockets)
- [ ] Implementar rate limiting
- [ ] Agregar tests unitarios e integración
- [ ] Configurar CI/CD
- [ ] Agregar monitoring con Prometheus/Grafana
- [ ] Implementar upload de imágenes
- [ ] Agregar sistema de hashtags
- [ ] Implementar menciones (@usuario)

## 📄 Licencia

MIT

## 👥 Contribuciones

¡Las contribuciones son bienvenidas! Por favor abre un issue o pull request.