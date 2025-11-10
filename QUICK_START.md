# 🚀 Quick Start - Microtweet

## ⚡ Inicio Rápido (5 minutos)

### 1. Clonar y configurar

```bash
git clone https://github.com/tu-usuario/microtweet.git
cd microtweet
cp .env.example .env
```

### 2. Levantar servicios

```bash
docker-compose up -d
```

### 3. Verificar que todo funciona

```bash
# Esperar 15 segundos para que inicien los servicios
sleep 15

# Probar API
curl http://localhost:3000/health
```

### 4. Crear tu primer usuario

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "miusuario",
    "email": "mi@email.com",
    "password": "mipassword123"
  }'
```

Guarda el **token** que recibes en la respuesta.

### 5. Crear tu primer tweet

```bash
TOKEN="tu-token-aqui"

curl -X POST http://localhost:3000/api/tweets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "content": "¡Mi primer tweet! 🚀"
  }'
```

### 6. Ver el feed público

```bash
curl http://localhost:3000/api/feeds/public
```

¡Listo! Ya tienes Microtweet funcionando.

---

## 📋 Comandos Esenciales

```bash
# Ver logs
docker-compose logs -f

# Reiniciar servicios
docker-compose restart

# Detener todo
docker-compose down

# Borrar todo (¡cuidado! borra la base de datos)
docker-compose down -v
```

---

## 🎯 Endpoints Principales

### Autenticación
- `POST /api/auth/register` - Registrarse
- `POST /api/auth/login` - Iniciar sesión

### Usuarios
- `GET /api/users/:id` - Ver perfil
- `PUT /api/users/:id` - Actualizar perfil (requiere auth)
- `POST /api/users/:id/follow` - Seguir usuario (requiere auth)
- `DELETE /api/users/:id/follow` - Dejar de seguir (requiere auth)

### Tweets
- `POST /api/tweets` - Crear tweet (requiere auth)
- `GET /api/tweets/:id` - Ver tweet
- `PUT /api/tweets/:id` - Editar tweet (requiere auth)
- `DELETE /api/tweets/:id` - Eliminar tweet (requiere auth)

### Feeds
- `GET /api/feeds/public` - Feed público
- `GET /api/feeds/personal/:userId` - Feed personalizado (requiere auth)

---

## ❓ FAQ

### ¿Cómo reseteo la base de datos?

```bash
docker-compose down -v
docker-compose up -d
```

### ¿Cómo veo qué está pasando en los servicios?

```bash
# Todos los servicios
docker-compose logs -f

# Solo un servicio
docker-compose logs -f tweet-service
```

### ¿Por qué un servicio no inicia?

```bash
# Ver el estado
docker-compose ps

# Ver logs del servicio problemático
docker-compose logs nombre-servicio

# Reiniciar el servicio
docker-compose restart nombre-servicio
```

### ¿Cómo me conecto a la base de datos?

```bash
docker exec -it microtweet-postgres psql -U microtweet -d microtweet_db
```

### ¿Cómo limpio el cache de Redis?

```bash
docker exec -it microtweet-redis redis-cli FLUSHALL
```

### ¿Los tweets tienen límite de caracteres?

Sí, 280 caracteres (como Twitter).

### ¿Puedo usar esto en producción?

Este proyecto es una base sólida, pero necesitarías:
- Cambiar el `JWT_SECRET` por uno seguro
- Implementar HTTPS
- Agregar rate limiting
- Configurar backups de la base de datos
- Implementar logging centralizado
- Agregar monitoreo (Prometheus, Grafana)

### ¿Cómo escalo los servicios?

```bash
docker-compose up -d --scale tweet-service=3
```

### ¿Dónde están los datos?

- **PostgreSQL**: Docker volume `postgres_data`
- **Redis**: En memoria (se pierde al reiniciar)

### ¿Puedo cambiar los puertos?

Sí, edita `docker-compose.yml`:

```yaml
api-gateway:
  ports:
    - "8080:3000"  # Cambiar 3000 por el puerto que quieras
```

---

## 🐛 Troubleshooting Rápido

### "Address already in use"

Un puerto ya está ocupado. Opciones:
1. Detén el proceso que usa el puerto
2. Cambia el puerto en `docker-compose.yml`

```bash
# Ver qué proceso usa el puerto 3000
lsof -i :3000

# Matar el proceso
kill -9 <PID>
```

### "Cannot connect to database"

```bash
# Reinicia PostgreSQL
docker-compose restart postgres

# Espera 10 segundos
sleep 10

# Reinicia los servicios
docker-compose restart
```

### "Invalid token"

Tu token expiró o es inválido. Haz login nuevamente:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tu@email.com",
    "password": "tupassword"
  }'
```

### Los servicios no inician

```bash
# Rebuild completo
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

---

## 📚 Recursos Adicionales

- **README.md** - Documentación completa
- **ADVANCED.md** - Guía de debugging y optimización
- **scripts/test-api.sh** - Script de testing automatizado
- **docker-compose.yml** - Configuración de servicios

---

## 🆘 ¿Necesitas ayuda?

1. Revisa los logs: `docker-compose logs`
2. Verifica el estado: `docker-compose ps`
3. Ejecuta los tests: `bash scripts/test-api.sh`
4. Abre un issue en GitHub

---

## 🎉 Siguientes Pasos

Una vez que tengas todo funcionando:

1. **Explora la API** usando Postman o curl
2. **Modifica el código** y ve los cambios
3. **Agrega features** nuevas (likes, retweets, etc.)
4. **Escala servicios** y prueba la arquitectura
5. **Implementa tests** unitarios e integración

¡Diviértete construyendo! 🚀