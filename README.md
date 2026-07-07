# Task Manager API

Una API REST deliberadamente sobre-diseñada con fines de aprendizaje, implementando los principios de **Clean Architecture** en un backend con Node.js + TypeScript. El objetivo nunca fue construir un gestor de tareas simple — fue entender cómo los profesionales estructuran, prueban y mantienen backends de nivel empresarial.

---

## ¿Por qué sobre-diseñado?

La mayoría de los tutoriales te muestran _qué_ construir. Este proyecto fue construido para entender _cómo_ lo construyen los profesionales. Cada decisión — desde la estructura de carpetas hasta el manejo de errores y la estrategia de tests — refleja lo que encontrarías en el codebase de una institución financiera.

---

## Stack tecnológico

| Capa                   | Tecnología                                         |
| ---------------------- | -------------------------------------------------- |
| Runtime                | Node.js 25 (`--env-file` nativo, `--watch` nativo) |
| Lenguaje               | TypeScript                                         |
| Framework              | Express                                            |
| ORM                    | Prisma                                             |
| Base de datos          | PostgreSQL (via Docker)                            |
| Autenticación          | JWT con RS256 (via `jose`)                         |
| Hashing de contraseñas | bcrypt                                             |
| Validación             | Zod                                                |
| Testing                | Vitest                                             |
| Linting                | ESLint v9 (flat config)                            |
| Formateo               | Prettier                                           |

---

## Clean Architecture

Todo el codebase sigue Clean Architecture — un patrón donde el código se organiza en capas concéntricas y las **dependencias solo apuntan hacia adentro**. Las capas internas no saben nada de las externas.

```
┌─────────────────────────────────────────┐
│         Frameworks & Drivers            │  ← Express, PostgreSQL, Prisma, bcrypt
│  ┌───────────────────────────────────┐  │
│  │      Interface Adapters           │  │  ← Controllers, Repositories, Middlewares
│  │  ┌─────────────────────────────┐  │  │
│  │  │         Use Cases           │  │  │  ← Reglas de negocio de la aplicación
│  │  │  ┌───────────────────────┐  │  │  │
│  │  │  │       Entities        │  │  │  │  ← Reglas de negocio empresariales
│  │  │  └───────────────────────┘  │  │  │
│  │  └─────────────────────────────┘  │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
           ↑ regla de dependencia: solo apunta hacia adentro
```

### Qué significa esto en la práctica

- Las entidades `Task`, `User` y `Project` tienen **cero dependencias externas** — sin Express, sin Prisma, sin librerías
- Los use cases solo dependen de **interfaces** (ports), nunca de implementaciones concretas
- PostgreSQL puede ser reemplazado por MongoDB sin tocar una sola línea de lógica de negocio
- Cada use case es completamente testeable **sin base de datos**

---

## Estructura del proyecto

```
src/
├── domain/                     ← El corazón de la aplicación
│   ├── entities/               ← Objetos de negocio con sus reglas
│   │   ├── Task.ts
│   │   ├── User.ts
│   │   └── Project.ts
│   ├── repositories/           ← Interfaces (ports) — sin implementaciones
│   │   ├── TaskRepository.ts
│   │   ├── UserRepository.ts
│   │   └── ProjectRepository.ts
│   ├── services/               ← Interfaces de servicios de dominio
│   │   ├── PasswordHasher.ts
│   │   └── TokenService.ts
│   ├── errors/                 ← Errores de dominio con códigos HTTP
│   └── types/
│       └── types.ts
│
├── application/                ← Un use case = un archivo = una responsabilidad
│   ├── dtos/                   ← Tipos de entrada/salida compartidos
│   ├── errors/                 ← Errores de capa de aplicación
│   └── use-cases/
│       ├── auth/               ← SignInUseCase, SignUpUseCase
│       ├── task/               ← CRUD + FindAllByUserId + FindAllByProjectId
│       ├── user/               ← CRUD
│       └── project/            ← CRUD + gestión de miembros + gestión de tareas
│
├── infrastructure/             ← Todo lo externo
│   ├── repositories/           ← Implementaciones Prisma de las interfaces de dominio
│   ├── services/               ← BcryptPasswordHasher, JoseTokenService
│   ├── http/
│   │   ├── controllers/        ← Traducen HTTP ↔ use cases
│   │   ├── middlewares/        ← Auth, error handler, validadores
│   │   ├── routes/             ← Definición de rutas
│   │   ├── schemas/            ← Schemas de validación con Zod
│   │   └── containers/         ← Composition root — ensambla todo
│   └── libs/
│       └── prisma.ts           ← Singleton del cliente Prisma
│
├── app.ts                      ← Configuración de Express
└── server.ts                   ← Punto de entrada
```

---

## Modelo de dominio

### Entidades y sus reglas

**Task**

- No puede tener nombre vacío
- El deadline debe ser posterior a la fecha de creación
- Las transiciones de estado se validan internamente

**User**

- Username: alfanumérico + guión bajo, mínimo 3 caracteres
- Contraseña: mínimo 8 caracteres
- Email: formato válido requerido
- Soft delete — los usuarios nunca se eliminan físicamente de la base de datos

**Project**

- Nombre mínimo 3 caracteres
- El dueño no puede ser eliminado como miembro
- Mantiene internamente los IDs de miembros e IDs de tareas
- Soft delete — igual que los usuarios

---

## Autenticación

Autenticación JWT usando **RS256** (claves asimétricas) — el estándar de la industria para aplicaciones financieras.

- La clave privada firma el token (solo en el servidor)
- La clave pública lo verifica (puede compartirse con otros servicios)
- Tokens almacenados en **cookies HttpOnly** — no accesibles desde JavaScript, protegidos contra XSS
- `sameSite: strict` — protegido contra CSRF

---

## Rutas de la API

### Autenticación

```
POST   /api/auth              Registro
POST   /api/auth/signin       Inicio de sesión
```

### Usuarios (requiere autenticación)

```
GET    /api/users             Obtener todos los usuarios
GET    /api/users/:id         Obtener usuario por id
PATCH  /api/users/:id         Actualizar usuario
DELETE /api/users/:id         Eliminar usuario (soft delete)
```

### Tareas (requiere autenticación)

```
GET    /api/tasks                          Obtener todas las tareas del usuario autenticado
GET    /api/tasks/:id                      Obtener tarea por id
GET    /api/projects/:projectId/tasks      Obtener todas las tareas de un proyecto
POST   /api/tasks                          Crear tarea
PATCH  /api/tasks/:id                      Actualizar tarea
DELETE /api/tasks/:id                      Eliminar tarea
```

### Proyectos (requiere autenticación)

```
GET    /api/projects                              Obtener todos los proyectos del usuario autenticado
GET    /api/projects/:id                          Obtener proyecto por id
POST   /api/projects                              Crear proyecto
PATCH  /api/projects/:id                          Actualizar nombre del proyecto
DELETE /api/projects/:id                          Eliminar proyecto (soft delete)
POST   /api/projects/:id/members/:memberId        Agregar miembro
DELETE /api/projects/:id/members/:memberId        Eliminar miembro
POST   /api/projects/:id/tasks/:taskId            Agregar tarea al proyecto
DELETE /api/projects/:id/tasks/:taskId            Quitar tarea del proyecto
```

---

## Estrategia de testing

Los tests están divididos en dos categorías con comandos separados para que los tests unitarios nunca esperen a la base de datos.

```
tests/
├── domain/                     ← Reglas de entidades y lógica de negocio
│   ├── User.test.ts
│   ├── Task.test.ts
│   └── Project.test.ts
├── application/                ← Use cases con repositorios falsos en memoria (sin DB)
│   ├── auth.use-cases.test.ts
│   ├── task.use-cases.test.ts
│   ├── user.use-cases.test.ts
│   └── project.use-cases.test.ts
└── integration/                ← Base de datos PostgreSQL real
    ├── setup.ts
    ├── helpers/
    │   └── cleanDatabase.ts
    ├── repositories/
    │   ├── PrismaUserRepository.test.ts
    │   ├── PrismaTaskRepository.test.ts
    │   └── PrismaProjectRepository.test.ts
    └── api/
        └── TaskRoutes.test.ts
```

```bash
npm run test:unit         # Tests de dominio + aplicación (rápido, sin DB)
npm run test:integration  # Tests de repositorios + API (requiere Docker)
npm run test:run          # Todos los tests una vez
npm test                  # Modo watch
```

Los tests unitarios usan **repositorios falsos en memoria** que implementan las mismas interfaces que los reales — los use cases no tienen idea de que no están hablando con una base de datos real. Esto es el patrón Ports & Adapters en acción.

---

## Cómo correrlo localmente

### Requisitos

- Node.js 25+
- Docker Desktop

### Configuración

```bash
# Instalar dependencias
npm install

# Levantar bases de datos
docker compose up -d

# Generar cliente Prisma
npx prisma generate

# Correr migraciones
npx prisma migrate deploy
DATABASE_URL="Aqui va tu TEST_URL de el .env" npx prisma migrate deploy

# Generar claves RS256
node scripts/generate-keys.ts
# Copiar el output a .env PRIVATE_KEY y .env PUBLIC_KEY
```

# Iniciar servidor de desarrollo

npm run dev

```

### Variables de entorno (`.env`)

```

PRIVATE_KEY="Key content here"
PUBLIC_KEY="Key content here"
PORT=3000
DATABASE_URL="postgresql://root:root@localhost:5432/taskdb"
DATABASE_TEST_URL="postgresql://root:root@localhost:5433/taskdb_test"
NODE_ENV="development"

```

---

## Patrones clave utilizados

**Ports & Adapters** — el dominio define interfaces, la infraestructura las implementa. El dominio nunca importa desde la infraestructura.

**Responsabilidad única por Use Case** — `CreateTaskUseCase` hace una sola cosa. `DeleteTaskUseCase` hace una sola cosa. Sin clases service con 15 métodos.

**Defense in Depth** — cada controller verifica la autenticación de forma independiente, incluso detrás del middleware de auth. Un middleware faltante nunca causa una falla de seguridad silenciosa.

**Prevención de enumeración de usuarios** — `SignInUseCase` retorna el mismo `UserNotFoundError` ya sea que el username no exista o que la contraseña sea incorrecta. Un atacante no puede determinar qué usuarios están registrados.

**Soft Delete** — usuarios y proyectos nunca se eliminan físicamente. Se setea `deletedAt` en su lugar, preservando registros de auditoría — un requisito estricto en sistemas financieros.

**DTOs en los límites** — las entidades nunca salen del dominio sin procesar. `toJSON()` controla exactamente qué datos se exponen en las respuestas, manteniendo los detalles de implementación internos.

---

## Deuda técnica conocida

- `findByUsername` y `findByEmail` en `PrismaUserRepository` no filtran por `deletedAt: null` — un usuario eliminado con username o email único bloquea el re-registro con esa credencial. Diferido intencionalmente.
- `Task` no implementa soft delete — solo hard delete.
```
