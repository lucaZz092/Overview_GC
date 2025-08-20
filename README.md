# 📌 Gestão de GC’s (Grupos de Comunhão)

Sistema para gerenciamento de **grupos de comunhão (GC’s)** com controle de **usuários, membros e encontros**, desenvolvido em **React (frontend)** e **Node.js + Express + Prisma + PostgreSQL (backend)**.

---

## 🚀 Tecnologias
### **Frontend**
- [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [Shadcn/UI](https://ui.shadcn.com/) (componentes)
- [Axios](https://axios-http.com/) (requisições HTTP)

### **Backend**
- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [Prisma ORM](https://www.prisma.io/)
- [PostgreSQL](https://www.postgresql.org/)
- [JWT](https://jwt.io/) para autenticação
- [bcryptjs](https://github.com/dcodeIO/bcrypt.js) para hashing de senhas

---

## 📂 Estrutura do Projeto

### **Backend (`gc-backend/`)**

gc-backend/
├── node_modules/ # Dependências do backend
├── prisma/ # Configurações do Prisma ORM
│ └── schema.prisma
├── .env # Variáveis de ambiente (DB, JWT, porta, etc.)
├── package.json # Configuração do backend
└── tsconfig.json # Configuração do TypeScript


### **Frontend (`src/`)**

src/
├── components/ # Componentes reutilizáveis
│ ├── ui/ # Componentes de interface (inputs, botões, etc.)
│ ├── Dashboard.tsx
│ ├── Login.tsx
│ ├── RegistroEncontro.tsx
│ ├── RegistroMembro.tsx
│ └── RegistroUser/
│
├── hooks/ # Hooks customizados
│ ├── use-mobile.tsx
│ └── use-toast.ts
│
├── lib/ # Funções utilitárias
│ └── utils.ts
│
├── pages/ # Páginas principais
│ ├── Index.tsx
│ ├── Notfound/
│ └── RegistroUser/
│
├── App.tsx # Ponto principal da aplicação
├── main.tsx # Entrada React
├── index.css # Estilos globais
└── vite-env.d.ts # Tipagem do Vite


### **Configurações e Raiz**

public/ # Arquivos estáticos
│── favicon.ico
│── robots.txt
│── placeholder.svg

.gitignore
bun.lockb
components.json
eslint.config.json
index.html
package.json
package-lock.json
postcss.config.json
tailwind.config.ts
tsconfig.json
vite.config.ts
README.md


---

## ⚙️ Como rodar o projeto

### 🔹 1. Clonar o repositório
```bash
git clone https://github.com/lucaZz092/gestao-gcs.git
cd gestao-gcs

🔹 2. Instalar dependências

👉 Se estiver usando npm:

npm install

👉 Se preferir usar bun:

bun install

👉 Para o backend:

cd gc-backend
npm install

🔹 3. Configurar variáveis de ambiente

Crie um arquivo .env dentro de gc-backend/ com:

DATABASE_URL="postgresql://postgres:postgres@localhost:5432/gc_db?schema=public"
JWT_SECRET="uma_chave_secreta_segura"
PORT=3000
ALLOWED_ORIGINS="http://localhost:5173"

🔹 4. Rodar migrações do Prisma
cd gc-backend
npx prisma migrate dev --name init

🔹 5. Subir o backend
npm run dev


A API ficará em http://localhost:3000

🔹 6. Subir o frontend

Na raiz do projeto:

npm run dev

O frontend ficará em http://localhost:5173

🧪 Testando

Acesse http://localhost:5173 no navegador para abrir o frontend.

Teste a API no http://localhost:3000 com ferramentas como Insomnia, Postman ou curl.


📌 Próximos passos:

✅ Criar telas de autenticação

✅ Implementar cadastro de usuários/membros

⏳ Relatórios de presença

⏳ Deploy em produção (Railway, Render ou Vercel + Supabase/Neon)

👥 Colaboradores

Lucas Mendonça (@lucaZz092)

[demais colaboradores]