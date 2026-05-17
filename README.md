# Sistema de Gestión Clínica Veterinaria (MVP)

## Objetivo

Construir un sistema compuesto por un sistema web administrativo para veterinarios y una aplicación móvil para clientes, mediante el uso de tecnologías como Next.js para la parte web y React Native (Expo) para la aplicación móvil, sincronizadas con una plataforma BaaS, específicamente Supabase.

## Metodologia/Arquitectura del proyecto

El proyecto sigue un enfoque de Feature-Driven Architecture (FDA), organizandolo al código por funcionales. Esto permite separar las funcionalidades del dominio en
modulos, que facilita la escabilidad del proyecto a medida que se requieran nuevas funcionales. Tambien se hace uso de los principios S.O.L.I.D, para asegurar la mantenibilidad del proyecto.

### Ejemplo

```

features
├── auth
│   └── components
│       └── LoginForm.tsx
├── calendar
│   ├── components
│   │   ├── AdminCalendar.tsx
│   │   └── VeterinarianCalendar.tsx
│   ├── hooks
│   │   ├── useAddAppointment.ts
│   │   ├── useAddUnavailableDates.ts
│   │   ├── useAppointment.ts
│   │   ├── useChangeStatusAppointment.ts
│   │   ├── useEditAppointment.ts
│   │   ├── useEditUnavailableDate.ts
│   │   ├── useEvents.ts
│   │   ├── usePetsAndOwners.ts
│   │   └── useRemoveUnavailableDate.ts
│   └── services
│       └── calendar.service.ts
├── chat
│   ├── components
│   │   ├── Chat.tsx
│   │   ├── ConversationList.tsx
│   │   └── MessageItem.tsx
│   ├── hooks
│   │   ├── useConversations.ts
│   │   └── useRealtimeChat.ts
│   └── services
│       └── chat.services.ts
├── clinical_history
│   ├── components
│   │   ├── ClinicalHistoryForm.tsx
│   │   └── TableClinicalHistories.tsx
│   ├── hooks
│   │   ├── useClinicalHistories.ts
│   │   ├── useClinicalHistory.ts
│   │   └── useClinicalHistoryFiles.ts
│   └── services
│       └── clinical_history.service.ts
├── dashboard
│   ├── components
│   │   └── DashboardContent.tsx
│   ├── hooks
│   │   ├── useMonthlyIncome.ts
│   │   ├── useTotalCustomers.tsx
│   │   ├── useTotalPets.tsx
│   │   └── useTotalTodayAppointments.tsx
│   └── services
│       └── dashboard.service.ts
├── owners_pets
│   ├── components
│   │   ├── OwnerPetEditForm.tsx
│   │   ├── OwnerPetForm.tsx
│   │   └── OwnerPetsTable.tsx
│   ├── hooks
│   │   ├── useOnwerPet.ts
│   │   └── useOwnerPets.ts
│   └── services
│       └── owners_pets.services.ts
├── pets
│   ├── components
│   │   ├── PetsForm.tsx
│   │   └── TablePets.tsx
│   ├── hooks
│   │   ├── usePet.ts
│   │   └── usePets.ts
│   └── services
│       └── pets.service.ts
└── veterinarians
    ├── components
    │   ├── VeterinarianEditForm.tsx
    │   ├── VeterinarianForm.tsx
    │   └── VeterinarianTable.tsx
    ├── hooks
    │   ├── useVeterinarian.ts
    │   ├── useVeterinarianByProfileId.ts
    │   └── useVeterinarians.ts
    └── services
        └── veterinarian.service.ts

```

## Alcance del proyecto - Módulos

El sistema se compone de dos plataformas interconectadas a Supabase:

- Panel Web Administrativo (Next.js): núcleo operativo para recepcionistas, veterinarios.
- Aplicación Móvil (Expo — iOS, Android): acceso para clientes.

### Módulo 1: Agenda y Citas

| Funcionalidad       | Descripción                                                            |
| ------------------- | ---------------------------------------------------------------------- |
| Calendario          | Vista diario, semanal, mensual (Exclusivo de: Veterinario y recepcion) |
| Bloqueo de horarios | Descanso, juntas o días festivos (Exclusivo de: Veterinario).          |
| Citas configurables | Consulta general, vacunación, estética, cirugía, urgencia.             |
| Creación de citas   | Desde el panel web (Exclusivo de: recepcion)                           |

### Módulo 2: Expediente Clínico

| Funcionalidad       | Descripción                                                                                                         |
| ------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Ficha de paciente   | Incluye nombre, especie, raza, sexo, edad, peso, foto de perfil y propietario vinculado.                            |
| Historial Clínico   | Incluye motivo, diagnóstico, tratamiento, medicamentos indicados y veterinario responsable (Historial por consulta) |
| Registro de vacunas | Fechas de aplicación y próximas dosis calculadas automáticamente.                                                   |
| Adjunto de estudios | Carga de imágenes diagnósticas (radiografías, ecografías) en PDF o imagen                                           |

### Módulo 3: Dashboard

| Funcionalidad | Descripción                                                                         |
| ------------- | ----------------------------------------------------------------------------------- |
| KPIS          | citas del día, ingresos del mes, tasa, total de mascotas.                           |
| Exportacion   | Reportes a PDF y Excel para contabilidad externa.                                   |
| Graficos      | Evolución mensual: ingresos, nuevos pacientes registrados, servicios por categoría. |

### Módulo 4 — Aplicación Móvil

Rol: Cliente (dueño de mascota)

| Funcionalidad          | Descripción                                   |
| ---------------------- | --------------------------------------------- |
| Perfil de mascotas     | Foto, datos generales y próximas vacunas.     |
| Historial de consultas | Fecha, diagnóstico y tratamiento              |
| Notificaciones push    | Para recordatorio de citas y vacunas próximas |

## Stack Tecnológico

| Capa                    | Tecnología                       | Justificación                                                                                        |
| ----------------------- | -------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Frontend Web            | Next.js 14 (App Router)          | SSR/SSG para SEO, rutas de API integradas y excelente experiencia de desarrollo (DX).                |
| App Móvil               | Expo (SDK 54, React Native)      | Un solo codebase para iOS y Android.                                                                 |
| Backend / Base de Datos | Supabase (PostgreSQL + Realtime) | Autenticación, almacenamiento, Row Level Security y Realtime sin necesidad de un servidor adicional. |
| Notificaciones          | Expo Notifications + Resend      | Notificaciones push nativas en iOS/Android y correos transaccionales.                                |
| Almacenamiento          | Supabase Storage                 | Gestión de fotos de mascotas, PDFs de estudios.                                                      |
| Despliegue Web          | Vercel                           | CI/CD automático, preview deployments por Pull Request y Edge Functions.                             |
