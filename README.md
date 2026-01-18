# Digital Anslagstavla - Community Board

En fullstack webbapplikation för att dela inlägg och kommentarer i olika kategorier. Byggd med React TypeScript och .NET Minimal API.

## Projektbeskrivning

Digital Anslagstavla är en modern community board där användare kan skapa, redigera och ta bort inlägg, kommentera på andras inlägg samt söka och filtrera innehåll efter kategorier. Projektet demonstrerar fullstack-utveckling med modern webbteknik.

## Teknologier

### Frontend
- React 18 med TypeScript
- Vite som build tool
- Tailwind CSS för styling
- Lucide React för ikoner
- Custom hooks för state management

### Backend
- .NET 9.0 Minimal API
- Entity Framework Core med SQLite
- JWT för autentisering
- BCrypt för lösenordshashning

## Installation och körning

### Förutsättningar
- Node.js version 22 eller senare
- .NET 9.0 SDK
- Git

### Steg 1: Klona projektet
```bash
git clone https://github.com/linasidani/CommunityBoard.git
cd CommunityBoard
```

### Steg 2: Starta Backend
```bash
cd backend
dotnet restore
dotnet run
```
Backend körs på http://localhost:5160

### Steg 3: Starta Frontend
Öppna en ny terminal:
```bash
cd frontend
npm install
npm run dev
```
Frontend körs på http://localhost:5173

### Steg 4: Öppna i webbläsare
Navigera till http://localhost:5173

## Testanvändare

Projektet innehåller färdiga testanvändare för att underlätta testning:

**Admin-konto**
- Email: admin@test.com
- Lösenord: Admin123!
- Kan redigera och ta bort allt innehåll

**Användarkonto**
- Email: user@test.com
- Lösenord: User123!
- Kan bara redigera och ta bort eget innehåll

## Projektstruktur
```
CommunityBoard/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   ├── PostCard.tsx
│   │   │   ├── PostList.tsx
│   │   │   ├── PostModal.tsx
│   │   │   ├── PostDetail.tsx
│   │   │   └── AuthModal.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.tsx
│   │   │   ├── usePosts.tsx
│   │   │   ├── useComments.tsx
│   │   │   └── useDarkMode.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   └── package.json
│
├── backend/
│   ├── Program.cs
│   ├── communityboard.db
│   └── CommunityBoardAPI.csproj
│
└── README.md
```

## Databasstruktur

### Tabeller
- **Users**: Användarinformation med användarnamn, email, lösenordshash och roll
- **Posts**: Inlägg med titel, innehåll, kategori, användar-id och tidsstämpel
- **Comments**: Kommentarer kopplade till specifika inlägg

### SQL Views
- **PostsWithDetails**: Kombinerar posts med användarinformation och kommentarsantal
- **UserPostStats**: Visar statistik per användare inklusive antal posts, kommentarer och senaste aktivitet

## Säkerhetsfunktioner

- Lösenord hashas med BCrypt innan lagring i databasen
- JWT tokens används för autentiserad kommunikation mellan frontend och backend
- CORS-konfiguration säkerställer att endast tillåtna origins kan kommunicera med API:et
- Rollbaserad auktorisering på backend-endpoints

## API-endpoints

### Autentisering
- POST /api/auth/register - Registrera ny användare
- POST /api/auth/login - Logga in användare

### Posts
- GET /api/posts - Hämta alla inlägg
- GET /api/posts/{id} - Hämta specifikt inlägg
- POST /api/posts - Skapa nytt inlägg (kräver autentisering)
- PUT /api/posts/{id} - Uppdatera inlägg (kräver autentisering)
- DELETE /api/posts/{id} - Ta bort inlägg (kräver autentisering)

### Comments
- GET /api/posts/{postId}/comments - Hämta kommentarer för ett inlägg
- POST /api/posts/{postId}/comments - Skapa ny kommentar (kräver autentisering)
- DELETE /api/comments/{id} - Ta bort kommentar (kräver autentisering)

### Statistik
- GET /api/users/stats - Hämta användarstatistik

## Responsiv design

Applikationen är optimerad för olika skärmstorlekar:
- Mobiler: Mindre än 768px
- Tablets: 768px till 1024px
- Desktop: Större än 1024px

Layout anpassas automatiskt med hjälp av Tailwind CSS breakpoints.

## Utvecklare

Lina El-Sidani
Systemutvecklare .NET, TUC Yrkeshögskola
GitHub: github.com/linasidani